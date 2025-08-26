import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBN3cGVw6BTGoGbOWT5NGBBLZsmbukcIcY",
  authDomain: "couple-website-a0cf4.firebaseapp.com",
  projectId: "couple-website-a0cf4",
  storageBucket: "couple-website-a0cf4.firebasestorage.app",
  messagingSenderId: "53111283456",
  appId: "1:53111283456:web:fd311ad0c63c739df2dde5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);