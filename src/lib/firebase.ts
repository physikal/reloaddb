import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAlb-vuc4cG8HLvEwjZfKQZHbNAJOb5WZY",
  authDomain: "reloaddb-4c8e8.firebaseapp.com",
  projectId: "reloaddb-4c8e8",
  storageBucket: "reloaddb-4c8e8.firebasestorage.app",
  messagingSenderId: "996805453462",
  appId: "1:996805453462:web:cb4577319a35e5060f44b7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);