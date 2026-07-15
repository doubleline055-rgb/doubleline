import { db } from "./firebase-config.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

onSnapshot(doc(db, "content", "site"), (snap) => {
  if (!snap.exists()) return;

  const data = snap.data();
  document.querySelectorAll("[data-content]").forEach((el) => {
    const path = el.dataset.content;
    const value = getNestedValue(data, path);
    if (value) {
      el.textContent = value;
    }
  });
});