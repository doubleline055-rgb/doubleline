import { db, auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection, addDoc, getDocs, deleteDoc, doc, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const loginScreen = document.getElementById("loginScreen");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");

// ===== LOGIN =====
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  loginError.textContent = "";

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    loginError.textContent = "Wrong email or password. Try again.";
  }
});

logoutBtn.addEventListener("click", () => signOut(auth));

// ===== SHOW LOGIN OR DASHBOARD BASED ON LOGIN STATE =====
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginScreen.hidden = true;
    dashboard.hidden = false;
    loadFAQs();
  } else {
    loginScreen.hidden = false;
    dashboard.hidden = true;
  }
});

// ===== TAB SWITCHING =====
const tabs = document.querySelectorAll(".admin-tab");
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("is-active"));
    tab.classList.add("is-active");

    document.querySelectorAll(".admin-panel").forEach((panel) => {
      panel.classList.remove("is-active");
    });
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add("is-active");
  });
});

// ===== FAQ MANAGEMENT =====
const faqForm = document.getElementById("faqForm");
const faqAdminList = document.getElementById("faqAdminList");

faqForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = document.getElementById("faqQuestion").value;
  const answer = document.getElementById("faqAnswer").value;
  const order = Number(document.getElementById("faqOrder").value);

  await addDoc(collection(db, "faqs"), { question, answer, order });

  faqForm.reset();
  loadFAQs();
});

async function loadFAQs() {
  faqAdminList.innerHTML = "Loading...";
  const q = query(collection(db, "faqs"), orderBy("order"));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    faqAdminList.innerHTML = "<p>No FAQs yet. Add one above.</p>";
    return;
  }

  faqAdminList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const item = document.createElement("div");
    item.className = "admin-list-item";
    item.innerHTML = `
      <div class="admin-list-item__content">
        <strong>${data.question}</strong>
        <span>${data.answer}</span>
      </div>
      <button class="admin-list-item__delete" data-id="${docSnap.id}">Delete</button>
    `;
    faqAdminList.appendChild(item);
  });

  document.querySelectorAll(".admin-list-item__delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (confirm("Delete this FAQ?")) {
        await deleteDoc(doc(db, "faqs", btn.dataset.id));
        loadFAQs();
      }
    });
  });
}