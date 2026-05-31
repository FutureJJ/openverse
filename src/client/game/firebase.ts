import { getApps, initializeApp } from "firebase/app";

// Self-hosted Openverse does not depend on Firebase for any feature by
// default. The original Biomes deployment used Firebase Auth + Firestore;
// the fork moved those to Redis + server-side session cookies. The
// initializer below is kept so any lingering legacy import still resolves,
// but it only runs when NEXT_PUBLIC_FIREBASE_PROJECT_ID is set.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

export function initializeFirebaseIfNeeded() {
  if (!firebaseConfig.projectId) {
    return;
  }
  if (getApps().length > 0) {
    return;
  }
  initializeApp(firebaseConfig);
}
