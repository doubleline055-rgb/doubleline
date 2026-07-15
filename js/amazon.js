import { db } from "./firebase-config.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const amazonLink = document.getElementById("amazonLink");

if (amazonLink) {
  onSnapshot(doc(db, "settings", "site"), (snap) => {
    if (snap.exists() && snap.data().amazonUrl) {
      amazonLink.href = snap.data().amazonUrl;
    }
  });
}