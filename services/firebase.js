// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDgDBh89PlNAMukbxADnOvNvi49lW7EHTU",
  authDomain: "bloom-a0a2b.firebaseapp.com",
  projectId: "bloom-a0a2b",
  storageBucket: "bloom-a0a2b.firebasestorage.app",
  messagingSenderId: "421481885898",
  appId: "1:421481885898:web:d550b62eb8524a6f914433",
  measurementId: "G-G41EYHPYNF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);