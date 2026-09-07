import { LetterData, RecipientResponse } from '../types';
import { 
  saveLetterToFirestore, 
  getLetterFromFirestore, 
  getLettersByCreatorFromFirestore, 
  subscribeToLettersByCreator,
  deleteLetterFromFirestore, 
  submitLetterResponseToFirestore, 
  markLetterOpenedInFirestore,
  auth
} from './firebase';

const CREATOR_TOKEN_KEY = 'affectionate_link_creator_token';
const LOCAL_LETTERS_KEY = 'affectionate_link_local_letters';

export function getOrCreateCreatorToken(): string {
  let token = localStorage.getItem(CREATOR_TOKEN_KEY);
  if (!token) {
    token = `creator-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString(36)}`;
    localStorage.setItem(CREATOR_TOKEN_KEY, token);
  }
  return token;
}

export function getLocalLetters(): LetterData[] {
  try {
    const raw = localStorage.getItem(LOCAL_LETTERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalLetter(letter: LetterData) {
  try {
    const current = getLocalLetters();
    const existingIndex = current.findIndex((l) => l.id === letter.id);
    if (existingIndex >= 0) {
      current[existingIndex] = letter;
    } else {
      current.unshift(letter);
    }
    localStorage.setItem(LOCAL_LETTERS_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Error saving local letter:', err);
  }
}

export async function createLetter(letter: Partial<LetterData>): Promise<LetterData> {
  const creatorToken = getOrCreateCreatorToken();
  const currentUid = auth.currentUser?.uid;

  const letterPayload: LetterData = {
    id: letter.id || `love-${Math.random().toString(36).substring(2, 8)}`,
    creatorToken,
    creatorId: currentUid || letter.creatorId,
    theme: letter.theme || 'blooming-heart',
    recipientName: letter.recipientName || 'My Beloved',
    senderName: letter.senderName || 'Forever Yours',
    date: letter.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    title: letter.title || 'A Letter for You',
    content: letter.content || '',
    imageUrl: letter.imageUrl,
    imageCaption: letter.imageCaption,
    pages: letter.pages,
    musicEnabled: letter.musicEnabled !== false,
    envelopeSeal: letter.envelopeSeal || 'wax-heart',
    hasPassword: letter.hasPassword,
    password: letter.password,
    passwordHint: letter.passwordHint,
    createdAt: new Date().toISOString(),
    viewCount: 0,
    status: 'unread'
  };

  // Save to Firebase Firestore
  try {
    await saveLetterToFirestore(letterPayload, currentUid);
  } catch (err) {
    console.warn('Firebase save note:', err);
  }

  // Also try backend proxy if configured
  try {
    await fetch('/api/letters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(letterPayload)
    });
  } catch {
    // Non-blocking
  }

  saveLocalLetter(letterPayload);
  return letterPayload;
}

export async function fetchLetter(id: string): Promise<LetterData | null> {
  // Try Firestore first
  try {
    const fromFirestore = await getLetterFromFirestore(id);
    if (fromFirestore) {
      saveLocalLetter(fromFirestore);
      return fromFirestore;
    }
  } catch (err) {
    console.warn('Firestore fetch error:', err);
  }

  // Next try backend API
  try {
    const res = await fetch(`/api/letters/${id}`);
    if (res.ok) {
      const data: LetterData = await res.json();
      saveLocalLetter(data);
      return data;
    }
  } catch {
    // Non-blocking
  }

  // Fallback to local storage
  const local = getLocalLetters().find((l) => l.id === id);
  return local || null;
}

export async function markLetterOpened(id: string): Promise<LetterData | null> {
  // Sync to Firestore
  try {
    await markLetterOpenedInFirestore(id);
  } catch {
    // Non-blocking
  }

  try {
    const res = await fetch(`/api/letters/${id}/open`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      saveLocalLetter(data);
      return data;
    }
  } catch {
    // Non-blocking
  }

  const local = getLocalLetters().find((l) => l.id === id);
  if (local) {
    local.viewCount = (local.viewCount || 0) + 1;
    local.lastOpenedAt = new Date().toISOString();
    if (local.status === 'unread') local.status = 'opened';
    saveLocalLetter(local);
    return local;
  }
  return null;
}

export async function submitRecipientResponse(id: string, reactionEmoji: string, message: string): Promise<LetterData | null> {
  const response: RecipientResponse = {
    approved: true,
    reactionEmoji: reactionEmoji || '❤️',
    message: message || 'I accept with all my heart!',
    respondedAt: new Date().toISOString()
  };

  // Sync to Firestore
  try {
    await submitLetterResponseToFirestore(id, response);
  } catch (err) {
    console.warn('Firestore response sync warning:', err);
  }

  try {
    const res = await fetch(`/api/letters/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reactionEmoji, message })
    });
    if (res.ok) {
      const data = await res.json();
      saveLocalLetter(data);
      return data;
    }
  } catch {
    // Non-blocking
  }

  const local = getLocalLetters().find((l) => l.id === id);
  if (local) {
    local.status = 'approved';
    local.recipientResponse = response;
    saveLocalLetter(local);
    return local;
  }
  return null;
}

export async function getCreatorLetters(): Promise<LetterData[]> {
  const currentUid = auth.currentUser?.uid;
  let firestoreLetters: LetterData[] = [];

  if (currentUid) {
    try {
      firestoreLetters = await getLettersByCreatorFromFirestore(currentUid);
    } catch (err) {
      console.warn('Firestore creator letters fetch error:', err);
    }
  }

  const token = getOrCreateCreatorToken();
  let serverLetters: LetterData[] = [];
  try {
    const res = await fetch(`/api/letters/creator/${token}`);
    if (res.ok) {
      serverLetters = await res.json();
    }
  } catch {
    // Non-blocking
  }

  const local = getLocalLetters();
  const map = new Map<string, LetterData>();

  local.forEach((l) => map.set(l.id, l));
  serverLetters.forEach((l) => map.set(l.id, l));
  firestoreLetters.forEach((l) => map.set(l.id, l));

  const combined = Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  localStorage.setItem(LOCAL_LETTERS_KEY, JSON.stringify(combined));
  return combined;
}

export function subscribeToLiveLetters(
  creatorId: string | undefined,
  callback: (letters: LetterData[]) => void
): () => void {
  // 1. Send cached/local letters immediately
  const initialLocal = getLocalLetters();
  if (initialLocal.length > 0) {
    callback(initialLocal);
  }

  if (!creatorId) {
    return () => {};
  }

  // 2. Subscribe to real-time Firestore updates
  const unsubscribe = subscribeToLettersByCreator(creatorId, (cloudLetters) => {
    const map = new Map<string, LetterData>();
    cloudLetters.forEach((l) => map.set(l.id, l));

    // Also merge any local letters and save
    const local = getLocalLetters();
    local.forEach((loc) => {
      if (!map.has(loc.id)) {
        if (!loc.creatorId || loc.creatorId === creatorId) {
          loc.creatorId = creatorId;
          saveLetterToFirestore(loc, creatorId).catch(() => {});
        }
        map.set(loc.id, loc);
      }
    });

    const combined = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    localStorage.setItem(LOCAL_LETTERS_KEY, JSON.stringify(combined));
    callback(combined);
  });

  return unsubscribe;
}

export async function deleteLetter(id: string): Promise<void> {
  try {
    await deleteLetterFromFirestore(id);
  } catch {
    // Non-blocking
  }

  try {
    await fetch(`/api/letters/${id}`, { method: 'DELETE' });
  } catch {
    // Non-blocking
  }

  const current = getLocalLetters().filter((l) => l.id !== id);
  localStorage.setItem(LOCAL_LETTERS_KEY, JSON.stringify(current));
}

export async function requestRomanticSpark(prompt: string, mood: string, recipientName: string): Promise<string> {
  try {
    const res = await fetch('/api/ai/romantic-spark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, mood, recipientName })
    });
    if (res.ok) {
      const data = await res.json();
      return data.text || '';
    }
  } catch (err) {
    console.warn('Failed to call AI spark:', err);
  }
  return `In the silence between heartbeats, my thoughts always drift to you. You are the warmth in my cold days and the starlight in my midnight sky.`;
}
