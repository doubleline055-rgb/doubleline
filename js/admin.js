import { db, auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection, addDoc, getDocs, deleteDoc, doc, setDoc, getDoc,
  query, orderBy, serverTimestamp
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

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginScreen.hidden = true;
    dashboard.hidden = false;
    loadFAQs();
    loadPlans();
    loadPopupSettings();
    loadMessages();
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
      <button class="admin-list-item__delete" data-id="${docSnap.id}" data-col="faqs">Delete</button>
    `;
    faqAdminList.appendChild(item);
  });
  attachDeleteHandlers(faqAdminList, loadFAQs);
}

// ===== PLANS MANAGEMENT =====
const planForm = document.getElementById("planForm");
const planAdminList = document.getElementById("planAdminList");

planForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("planName").value;
  const price = document.getElementById("planPrice").value;
  const features = document.getElementById("planFeatures").value
    .split("\n")
    .map((f) => f.trim())
    .filter((f) => f.length > 0);
  const featured = document.getElementById("planFeatured").checked;

  await addDoc(collection(db, "plans"), { name, price, features, featured });
  planForm.reset();
  loadPlans();
});

async function loadPlans() {
  planAdminList.innerHTML = "Loading...";
  const snapshot = await getDocs(collection(db, "plans"));
  if (snapshot.empty) {
    planAdminList.innerHTML = "<p>No plans yet. Add one above.</p>";
    return;
  }
  planAdminList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const item = document.createElement("div");
    item.className = "admin-list-item";
    item.innerHTML = `
      <div class="admin-list-item__content">
        <strong>${data.name} — $${data.price}/mo ${data.featured ? "⭐" : ""}</strong>
        <span>${(data.features || []).join(", ")}</span>
      </div>
      <button class="admin-list-item__delete" data-id="${docSnap.id}" data-col="plans">Delete</button>
    `;
    planAdminList.appendChild(item);
  });
  attachDeleteHandlers(planAdminList, loadPlans);
}

// ===== POPUP / BANNER =====
const popupForm = document.getElementById("popupForm");
const popupStatus = document.getElementById("popupStatus");

popupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const type = document.getElementById("popupType").value;
  const text = document.getElementById("popupText").value;
  const active = document.getElementById("popupActive").checked;

  await setDoc(doc(db, "settings", "popup"), { type, text, active });
  popupStatus.textContent = "Saved!";
  setTimeout(() => (popupStatus.textContent = ""), 2000);
});

async function loadPopupSettings() {
  const snap = await getDoc(doc(db, "settings", "popup"));
  if (snap.exists()) {
    const data = snap.data();
    document.getElementById("popupType").value = data.type || "popup";
    document.getElementById("popupText").value = data.text || "";
    document.getElementById("popupActive").checked = !!data.active;
  }
}

// ===== CONTACT MESSAGES =====
const messagesAdminList = document.getElementById("messagesAdminList");

async function loadMessages() {
  messagesAdminList.innerHTML = "Loading...";
  const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    messagesAdminList.innerHTML = "<p>No messages yet.</p>";
    return;
  }
  messagesAdminList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const when = data.timestamp?.toDate ? data.timestamp.toDate().toLocaleString() : "";
    const item = document.createElement("div");
    item.className = "admin-list-item";
    item.innerHTML = `
      <div class="admin-list-item__content">
        <strong>${data.name} — ${data.email}${data.phone ? " — " + data.phone : ""}</strong>
        <span>${data.message}</span>
        <span style="display:block; margin-top:4px; opacity:0.6;">${when}</span>
      </div>
      <button class="admin-list-item__delete" data-id="${docSnap.id}" data-col="messages">Delete</button>
    `;
    messagesAdminList.appendChild(item);
  });
  attachDeleteHandlers(messagesAdminList, loadMessages);
}

// ===== SHARED DELETE HANDLER =====
function attachDeleteHandlers(container, reloadFn) {
  container.querySelectorAll(".admin-list-item__delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (confirm("Delete this item?")) {
        await deleteDoc(doc(db, btn.dataset.col, btn.dataset.id));
        reloadFn();
      }
    });
  });
}