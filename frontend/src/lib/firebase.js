import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBbLq9Arf8gYOryvHoDNwgCKrlXv7-DkC4",
  authDomain: "duosteam-be693.firebaseapp.com",
  projectId: "duosteam-be693",
  storageBucket: "duosteam-be693.firebasestorage.app",
  messagingSenderId: "239672919231",
  appId: "1:239672919231:web:b0753368163b900317f20a",
  measurementId: "G-6C1T662YGM"
};

const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);