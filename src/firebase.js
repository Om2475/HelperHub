// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKwQRd-vHmj5eZzXAoGGbgppV7ZbtTGOI",
  authDomain: "helperhub-7654e.firebaseapp.com",
  databaseURL: "https://helperhub-7654e-default-rtdb.firebaseio.com/",
  projectId: "helperhub-7654e",
  storageBucket: "helperhub-7654e.appspot.com",
  messagingSenderId: "341787884085",
  appId: "1:341787884085:web:dcf5db3ec4acab69950f7c",
  measurementId: "G-V4DWF9GYCD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const database = getDatabase(app);

export default app;
export { auth, storage, database };
