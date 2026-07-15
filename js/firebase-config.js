// Firebase connection setup — used by every page that needs the database
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBqXYa3HlUx6VUZfXjwehs-szlvWBPeRe8",
  authDomain: "doubleline-81bb6.firebaseapp.com",
  projectId: "doubleline-81bb6",
  storageBucket: "doubleline-81bb6.firebasestorage.app",
  messagingSenderId: "735872537892",
  appId: "1:735872537892:web:5e902dc61b6198fefd4fb1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);