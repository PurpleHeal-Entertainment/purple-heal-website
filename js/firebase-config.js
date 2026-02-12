// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCpqPvD8_OjqP2dz8khJ3Lz9_SorG5mbcU",
    authDomain: "purple-heal-admin.firebaseapp.com",
    projectId: "purple-heal-admin",
    storageBucket: "purple-heal-admin.firebasestorage.app",
    messagingSenderId: "690847612865",
    appId: "1:690847612865:web:f5381c76f8172104f43940"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
