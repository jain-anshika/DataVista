import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDHWaGcMzTQ6J3gdLh-B_jszcorWzMUBO4",
  authDomain: "datavista-c2ca7.firebaseapp.com",
  projectId: "datavista-c2ca7",
  storageBucket: "datavista-c2ca7.firebasestorage.app",
  messagingSenderId: "126336266027",
  appId: "1:126336266027:web:187ecf4e91adeb31c61f6e",
  measurementId: "G-Q1SDC7Q3V2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
