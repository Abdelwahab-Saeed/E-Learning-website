// IMPORT PACKAGES
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyDzkfiCihtsJ5ip08cx0QySH7UIpdVEKhM",
    authDomain: "e-laerning-1dcc6.firebaseapp.com",
    projectId: "e-laerning-1dcc6",
    storageBucket: "e-laerning-1dcc6.appspot.com",
    messagingSenderId: "1006424759938",
    appId: "1:1006424759938:web:cee85ec89369a138b25e9b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// EXPORT MODULES
export { collection, addDoc, getDocs, deleteDoc, doc, db, updateDoc };
