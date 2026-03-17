import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCdq-5RfkONOtN3_gsNoIlRHv1_S4NlOL4",
  authDomain: "furnisy-roomdesigner3d.firebaseapp.com",
  projectId: "furnisy-roomdesigner3d",
  storageBucket: "furnisy-roomdesigner3d.firebasestorage.app",
  messagingSenderId: "347008047189",
  appId: "1:347008047189:web:46847ff1f65883c56cdcdc",
};

// Firebase Initialize
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
