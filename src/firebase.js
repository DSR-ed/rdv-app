// Firebase initialization and exports (Firestore + optional Auth)
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

function hasAll(values) {
  return Object.values(values).every((v) => typeof v === 'string' && v.length > 0)
}

export const isFirebaseEnabled = hasAll(cfg)

let app, db, auth
if (isFirebaseEnabled) {
  app = initializeApp(cfg)
  db = getFirestore(app)
  auth = getAuth(app)
}

export { db, auth }

// Optional Google Auth helpers (no-op if disabled)
const provider = isFirebaseEnabled ? new GoogleAuthProvider() : null
export async function signInWithGoogle() {
  if (!isFirebaseEnabled) return null
  return signInWithPopup(auth, provider)
}
export async function signOutUser() {
  if (!isFirebaseEnabled) return null
  return signOut(auth)
}
