import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDxdYEP68RQJc5uHmiK3AGurEuM5rFTFjI",
  authDomain: "sartor-market-share.firebaseapp.com",
  projectId: "sartor-market-share",
  storageBucket: "sartor-market-share.firebasestorage.app",
  messagingSenderId: "482271503471",
  appId: "1:482271503471:web:81eec08209b2564c94999a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);