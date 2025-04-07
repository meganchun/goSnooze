import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithCredential,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDpPumdjePYXL2DZ_a-Dog5Ae22AN1KXQA",
  authDomain: "gosnooze-d1321.firebaseapp.com",
  projectId: "gosnooze-d1321",
  storageBucket: "gosnooze-d1321.firebasestorage.app",
  messagingSenderId: "614855422365",
  appId: "1:614855422365:web:980164e848ed760fe0ff74",
  measurementId: "G-L7RJ0Z5C4M",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
};
