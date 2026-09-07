import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  deleteDoc, 
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { LetterData, RecipientResponse, CreatorUser } from '../types';

export const firebaseConfig = {
  apiKey: "AIzaSyB3yzhRZFZY1or_weAYy9oNQrGrYppDkdQ",
  authDomain: "damons-affection.firebaseapp.com",
  projectId: "damons-affection",
  storageBucket: "damons-affection.firebasestorage.app",
  messagingSenderId: "841332738826",
  appId: "1:841332738826:web:26faea424afb9514d648f3"
};

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export function mapFirebaseUser(user: User | null): CreatorUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'Creator',
    photoURL: user.photoURL
  };
}

export function subscribeToAuth(callback: (user: CreatorUser | null) => void) {
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(mapFirebaseUser(firebaseUser));
  });
}

export async function registerCreator(email: string, pass: string, name?: string): Promise<CreatorUser> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (name && cred.user) {
    try {
      await updateProfile(cred.user, { displayName: name });
    } catch {
      // Non-blocking
    }
  }
  return mapFirebaseUser(cred.user)!;
}

export async function loginCreator(email: string, pass: string): Promise<CreatorUser> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return mapFirebaseUser(cred.user)!;
}

export async function loginWithGoogle(): Promise<CreatorUser> {
  const cred = await signInWithPopup(auth, googleProvider);
  return mapFirebaseUser(cred.user)!;
}

export async function logoutCreator(): Promise<void> {
  await signOut(auth);
}

// Letter CRUD with Firestore
export async function saveLetterToFirestore(letter: LetterData, creatorId?: string): Promise<void> {
  try {
    const letterRef = doc(db, 'letters', letter.id);
    const dataToSave = {
      ...letter,
      creatorId: creatorId || letter.creatorId || auth.currentUser?.uid || 'guest',
      updatedAt: new Date().toISOString()
    };
    await setDoc(letterRef, dataToSave, { merge: true });
  } catch (err) {
    console.warn('Firestore write warning, fallback to local storage:', err);
    throw err;
  }
}

export async function getLetterFromFirestore(id: string): Promise<LetterData | null> {
  try {
    const letterRef = doc(db, 'letters', id);
    const snapshot = await getDoc(letterRef);
    if (snapshot.exists()) {
      return snapshot.data() as LetterData;
    }
    return null;
  } catch (err) {
    console.warn('Firestore read error:', err);
    return null;
  }
}

export async function getLettersByCreatorFromFirestore(creatorId: string): Promise<LetterData[]> {
  try {
    const lettersRef = collection(db, 'letters');
    const q = query(lettersRef, where('creatorId', '==', creatorId));
    const querySnapshot = await getDocs(q);
    const results: LetterData[] = [];
    querySnapshot.forEach((d) => {
      results.push(d.data() as LetterData);
    });
    return results;
  } catch (err) {
    console.warn('Firestore query error:', err);
    return [];
  }
}

export function subscribeToLettersByCreator(
  creatorId: string, 
  callback: (letters: LetterData[]) => void
): () => void {
  try {
    const lettersRef = collection(db, 'letters');
    const q = query(lettersRef, where('creatorId', '==', creatorId));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const results: LetterData[] = [];
        querySnapshot.forEach((d) => {
          results.push(d.data() as LetterData);
        });
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(results);
      },
      (err) => {
        console.warn('Firestore live listener error:', err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to attach live Firestore listener:', err);
    return () => {};
  }
}

export async function deleteLetterFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'letters', id));
  } catch (err) {
    console.warn('Firestore delete error:', err);
  }
}

export async function submitLetterResponseToFirestore(id: string, response: RecipientResponse): Promise<void> {
  try {
    const letterRef = doc(db, 'letters', id);
    await updateDoc(letterRef, {
      recipientResponse: response,
      status: 'approved',
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Firestore response update error:', err);
  }
}

export async function markLetterOpenedInFirestore(id: string): Promise<void> {
  try {
    const letterRef = doc(db, 'letters', id);
    const snap = await getDoc(letterRef);
    if (snap.exists()) {
      const data = snap.data() as LetterData;
      const now = new Date().toISOString();
      await updateDoc(letterRef, {
        status: data.status === 'unread' ? 'opened' : data.status,
        viewCount: (data.viewCount || 0) + 1,
        firstOpenedAt: data.firstOpenedAt || now,
        lastOpenedAt: now,
        updatedAt: now
      });
    }
  } catch (err) {
    console.warn('Firestore mark opened error:', err);
  }
}
