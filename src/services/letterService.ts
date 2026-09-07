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

// Real-time live listeners registry
type LiveLettersCallback = (letters: LetterData[]) => void;
const liveListeners = new Set<LiveLettersCallback>();

// Cross-tab broadcast channel for instant multi-window/tab sync
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('damons_affection_sync_channel')
  : null;

if (syncChannel) {
  syncChannel.onmessage = (e) => {
    if (e.data?.type === 'LETTERS_UPDATED') {
      const current = getLocalLetters();
      liveListeners.forEach((cb) => {
        try { cb(current); } catch (err) { console.error(err); }
      });
    }
  };
}

// Window storage listener for cross-tab sync fallback
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === LOCAL_LETTERS_KEY) {
      const current = getLocalLetters();
      liveListeners.forEach((cb) => {
        try { cb(current); } catch (err) { console.error(err); }
      });
    }
  });
}

export function notifyLiveSubscribers(letters?: LetterData[]) {
  const list = letters || getLocalLetters();
  liveListeners.forEach((cb) => {
    try { cb(list); } catch (err) { console.error(err); }
  });
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type: 'LETTERS_UPDATED' });
    } catch {}
  }
}

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
    notifyLiveSubscribers(current);
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
    theme: letter.theme ?? 'blooming-heart',
    recipientName: letter.recipientName ?? '',
    senderName: letter.senderName ?? '',
    date: letter.date ?? '',
    title: letter.title ?? '',
    content: letter.content ?? '',
    imageUrl: letter.imageUrl,
    imageCaption: letter.imageCaption,
    pages: letter.pages,
    musicEnabled: letter.musicEnabled ?? false,
    envelopeSeal: letter.envelopeSeal ?? 'wax-heart',
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
  // Keep recipient links fast even when Firestore is slow to establish a connection.
  // Firestore remains the fallback of record when the app API is unavailable.
  try {
    const res = await fetch(`/api/letters/${id}`, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data: LetterData = await res.json();
      saveLocalLetter(data);
      return data;
    }
  } catch {
    // Continue with Firestore.
  }

  // Try Firestore next
  try {
    const fromFirestore = await getLetterFromFirestore(id);
    if (fromFirestore) {
      saveLocalLetter(fromFirestore);
      return fromFirestore;
    }
  } catch (err) {
    console.warn('Firestore fetch error:', err);
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

export async function submitRecipientResponse(
  id: string,
  reactionEmoji: string,
  message: string,
  approved: boolean
): Promise<LetterData | null> {
  const response: RecipientResponse = {
    approved,
    reactionEmoji: reactionEmoji || '❤️',
    message: message || (approved ? 'I accept with all my heart!' : 'I am sorry, but my heart is not ready to accept this letter.'),
    respondedAt: new Date().toISOString()
  };

  // Firestore is the source of truth for the creator's live dashboard.
  let firestoreUpdated: LetterData | null = null;
  const firestoreWrite = submitLetterResponseToFirestore(id, response).catch((err) => {
    console.warn('Firestore response sync warning:', err);
    return null;
  });
  firestoreUpdated = await Promise.race([
    firestoreWrite,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
  ]);

  if (firestoreUpdated) {
    saveLocalLetter(firestoreUpdated);
  }

  // Keep the server-side fallback in sync, but do not let it replace newer
  // Firestore data or hold the recipient UI open indefinitely.
  try {
    const res = await fetch(`/api/letters/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reactionEmoji, message, approved }),
      signal: AbortSignal.timeout(2500)
    });
    if (res.ok && !firestoreUpdated) {
      const data = await res.json();
      saveLocalLetter(data);
      return data;
    }
  } catch {
    // Non-blocking
  }

  if (firestoreUpdated) return firestoreUpdated;

  const local = getLocalLetters().find((l) => l.id === id);
  if (local) {
    local.status = approved ? 'approved' : 'declined';
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
  const mergeLetter = (incoming: LetterData) => {
    const existing = map.get(incoming.id);
    if (!existing) {
      map.set(incoming.id, incoming);
      return;
    }

    // A response is more valuable than an older snapshot without one.
    // This prevents a stale Firestore/API read from hiding a recipient reply.
    if (existing.recipientResponse && !incoming.recipientResponse) return;
    if (!existing.recipientResponse && incoming.recipientResponse) {
      map.set(incoming.id, incoming);
      return;
    }

    if (existing.recipientResponse && incoming.recipientResponse) {
      const existingTime = new Date(existing.recipientResponse.respondedAt).getTime();
      const incomingTime = new Date(incoming.recipientResponse.respondedAt).getTime();
      if (incomingTime >= existingTime) map.set(incoming.id, incoming);
      return;
    }

    map.set(incoming.id, incoming);
  };

  local.forEach(mergeLetter);
  serverLetters.forEach(mergeLetter);
  firestoreLetters.forEach(mergeLetter);

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
  // 1. Register listener for immediate synchronous notifications
  liveListeners.add(callback);

  // 2. Send cached/local letters immediately
  const initialLocal = getLocalLetters();
  if (initialLocal.length > 0) {
    callback(initialLocal);
  }

  // 3. Perform immediate initial fetch from server & cloud
  getCreatorLetters().then((fresh) => {
    callback(fresh);
  }).catch(() => {});

  // 4. Subscribe to real-time Firestore updates if creatorId is present
  let firestoreUnsub: (() => void) | null = null;
  if (creatorId) {
    firestoreUnsub = subscribeToLettersByCreator(creatorId, (cloudLetters) => {
      const map = new Map<string, LetterData>();
      const mergeLetter = (incoming: LetterData) => {
        const existing = map.get(incoming.id);
        if (!existing || (!existing.recipientResponse && incoming.recipientResponse)) {
          map.set(incoming.id, incoming);
          return;
        }
        if (existing.recipientResponse && incoming.recipientResponse) {
          const existingTime = new Date(existing.recipientResponse.respondedAt).getTime();
          const incomingTime = new Date(incoming.recipientResponse.respondedAt).getTime();
          if (incomingTime >= existingTime) map.set(incoming.id, incoming);
        }
      };

      cloudLetters.forEach(mergeLetter);

      // Also merge any local letters and save
      const local = getLocalLetters();
      local.forEach((loc) => {
        if (!map.has(loc.id) || (!map.get(loc.id)?.recipientResponse && loc.recipientResponse)) {
          if (!loc.creatorId || loc.creatorId === creatorId) {
            loc.creatorId = creatorId;
            saveLetterToFirestore(loc, creatorId).catch(() => {});
          }
          mergeLetter(loc);
        }
      });

      const combined = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      localStorage.setItem(LOCAL_LETTERS_KEY, JSON.stringify(combined));
      callback(combined);
    });
  }

  // 5. Background live poll every 3.5 seconds to guarantee 100% live status and responses
  const pollInterval = setInterval(() => {
    getCreatorLetters().then((fresh) => {
      callback(fresh);
    }).catch(() => {});
  }, 3500);

  return () => {
    liveListeners.delete(callback);
    if (firestoreUnsub) {
      firestoreUnsub();
    }
    clearInterval(pollInterval);
  };
}

export async function deleteLetter(id: string): Promise<void> {
  const current = getLocalLetters().filter((l) => l.id !== id);
  localStorage.setItem(LOCAL_LETTERS_KEY, JSON.stringify(current));
  notifyLiveSubscribers(current);

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
