import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, inMemoryPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgDBh89PlNAMukbxADnOvNvi49lW7EHTU",
  authDomain: "bloom-a0a2b.firebaseapp.com",
  projectId: "bloom-a0a2b",
  storageBucket: "bloom-a0a2b.firebasestorage.app",
  messagingSenderId: "421481885898",
  appId: "1:421481885898:web:d550b62eb8524a6f914433",
  measurementId: "G-G41EYHPYNF"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: inMemoryPersistence
});

export const db = getFirestore(app);