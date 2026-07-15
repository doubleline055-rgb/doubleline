import { db, auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection, addDoc, getDocs, deleteDoc, doc, setDoc, getDoc,
  query, orderBy
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
    loadSiteSettings();
    loadContentFields();
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
    .split("\n").map((f) => f.trim()).filter((f) => f.length > 0);
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

// ===== SITE SETTINGS (Amazon link) =====
const settingsForm = document.getElementById("settingsForm");
const settingsStatus = document.getElementById("settingsStatus");

settingsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const amazonUrl = document.getElementById("amazonUrl").value;
  await setDoc(doc(db, "settings", "site"), { amazonUrl });
  settingsStatus.textContent = "Saved!";
  setTimeout(() => (settingsStatus.textContent = ""), 2000);
});

async function loadSiteSettings() {
  const snap = await getDoc(doc(db, "settings", "site"));
  if (snap.exists()) {
    document.getElementById("amazonUrl").value = snap.data().amazonUrl || "";
  }
}

// ===== SITE TEXT (CONTENT) =====
const CONTENT_FIELDS = [
  { section: "Hero", key: "hero.eyebrow", label: "Small label above headline", type: "text", default: "Kosher. No Data. No Games." },
  { section: "Hero", key: "hero.titleLine1", label: "Headline — line 1", type: "text", default: "One kosher phone." },
  { section: "Hero", key: "hero.titleLine2", label: "Headline — line 2", type: "text", default: "Two numbers." },
  { section: "Hero", key: "hero.titleLine3", label: "Headline — line 3 (accent color)", type: "text", default: "Zero extra charges." },
  { section: "Hero", key: "hero.subtitle", label: "Subtitle paragraph", type: "textarea", default: "Dubole Line gives you a real Israeli number and a US-reachable number on one kosher line — so family and friends call from the States without paying a cent extra, and you never touch data." },
  { section: "Hero", key: "hero.ctaPrimary", label: "Primary button text", type: "text", default: "See the Plans" },
  { section: "Hero", key: "hero.ctaSecondary", label: "Secondary button text", type: "text", default: "How It Works →" },

  { section: "Trust Strip", key: "trust.item1", label: "Item 1", type: "text", default: "Kosher certified" },
  { section: "Trust Strip", key: "trust.item2", label: "Item 2", type: "text", default: "No internet, no data" },
  { section: "Trust Strip", key: "trust.item3", label: "Item 3", type: "text", default: "Real human support" },

  { section: "How It Works", key: "how.eyebrow", label: "Small label", type: "text", default: "How It Works" },
  { section: "How It Works", key: "how.title", label: "Section title", type: "text", default: "Three steps. One kosher line." },
  { section: "How It Works", key: "how.step1Title", label: "Step 1 title", type: "text", default: "Order your SIM" },
  { section: "How It Works", key: "how.step1Text", label: "Step 1 text", type: "textarea", default: "Choose a plan and order your kosher SIM card directly from the site, or through Amazon." },
  { section: "How It Works", key: "how.step2Title", label: "Step 2 title", type: "text", default: "Get two numbers, one line" },
  { section: "How It Works", key: "how.step2Text", label: "Step 2 text", type: "textarea", default: "Your SIM arrives with a real Israeli number and a US-reachable number, active on a single kosher device." },
  { section: "How It Works", key: "how.step3Title", label: "Step 3 title", type: "text", default: "Call, without the extra charge" },
  { section: "How It Works", key: "how.step3Text", label: "Step 3 text", type: "textarea", default: "Family in the US call your US-reachable number like a local call. No roaming games, no data, ever." },

  { section: "Plans", key: "plans.eyebrow", label: "Small label", type: "text", default: "Plans" },
  { section: "Plans", key: "plans.title", label: "Section title", type: "text", default: "Pick your line" },
  { section: "Plans", key: "plans.subtitle", label: "Subtitle", type: "textarea", default: "Final pricing is confirmed at checkout. Plans below are a preview." },
  { section: "Plans", key: "plans.amazonPrefix", label: "Amazon line prefix text", type: "text", default: "Prefer Amazon?" },
  { section: "Plans", key: "plans.amazonLinkText", label: "Amazon link text", type: "text", default: "Buy the SIM card here →" },

  { section: "FAQ", key: "faq.eyebrow", label: "Small label", type: "text", default: "FAQ" },
  { section: "FAQ", key: "faq.title", label: "Section title", type: "text", default: "Questions, answered" },
  { section: "FAQ", key: "faq.note", label: "Bottom note", type: "text", default: "More questions get added here regularly." },

  { section: "About", key: "about.eyebrow", label: "Small label", type: "text", default: "About" },
  { section: "About", key: "about.title", label: "Section title", type: "text", default: "Double everything, simplified" },
  { section: "About", key: "about.body", label: "Body paragraph", type: "textarea", default: "Dubole Line was built for one purpose: let people live a kosher, data-free life without cutting off the people who call them from the US. One kosher device, two numbers, no extra charges — that's double everything." },

  { section: "Contact", key: "contact.eyebrow", label: "Small label", type: "text", default: "Contact" },
  { section: "Contact", key: "contact.title", label: "Section title", type: "text", default: "Questions? We're here." },
  { section: "Contact", key: "contact.subtitle", label: "Subtitle", type: "textarea", default: "Send a message and we'll get back to you directly." },

  { section: "Footer", key: "footer.copyright", label: "Copyright line", type: "text", default: "© 2026 Dubole Line. All rights reserved." },
];

const contentFieldsContainer = document.getElementById("contentFields");
const saveContentBtn = document.getElementById("saveContentBtn");
const contentStatus = document.getElementById("contentStatus");

function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

function setNestedValue(obj, path, value) {
  const keys = path.split(".");
  let cur = obj;
  keys.forEach((key, i) => {
    if (i === keys.length - 1) {
      cur[key] = value;
    } else {
      cur[key] = cur[key] || {};
      cur = cur[key];
    }
  });
}

function buildContentForm() {
  contentFieldsContainer.innerHTML = "";
  let currentSection = "";

  CONTENT_FIELDS.forEach((field) => {
    if (field.section !== currentSection) {
      currentSection = field.section;
      const heading = document.createElement("h3");
      heading.textContent = currentSection;
      heading.style.marginTop = "26px";
      heading.style.marginBottom = "10px";
      heading.style.fontSize = "16px";
      contentFieldsContainer.appendChild(heading);
    }

    const wrapper = document.createElement("label");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.gap = "6px";
    wrapper.style.fontWeight = "600";
    wrapper.style.fontSize = "13.5px";
    wrapper.style.marginBottom = "12px";

    const labelText = document.createElement("span");
    labelText.textContent = field.label;
    wrapper.appendChild(labelText);

    const inputEl = field.type === "textarea" ? document.createElement("textarea") : document.createElement("input");
    if (field.type !== "textarea") inputEl.type = "text";
    inputEl.dataset.key = field.key;
    inputEl.style.fontFamily = "var(--font-body)";
    inputEl.style.fontSize = "14px";
    inputEl.style.padding = "10px 12px";
    inputEl.style.borderRadius = "8px";
    inputEl.style.border = "1.5px solid rgba(0,0,0,0.12)";
    wrapper.appendChild(inputEl);

    contentFieldsContainer.appendChild(wrapper);
  });
}

async function loadContentFields() {
  buildContentForm();

  // Fill every field with its current default text first
  CONTENT_FIELDS.forEach((field) => {
    const el = document.querySelector(`#contentFields [data-key="${field.key}"]`);
    if (el) el.value = field.default || "";
  });

  // Then overwrite with anything already saved in Firestore
  const snap = await getDoc(doc(db, "content", "site"));
  if (snap.exists()) {
    const data = snap.data();
    document.querySelectorAll("#contentFields [data-key]").forEach((el) => {
      const value = getNestedValue(data, el.dataset.key);
      if (value) el.value = value;
    });
  }
}

saveContentBtn.addEventListener("click", async () => {
  const updates = {};
  document.querySelectorAll("#contentFields [data-key]").forEach((el) => {
    const value = el.value.trim();
    if (value.length > 0) {
      setNestedValue(updates, el.dataset.key, value);
    }
  });

  await setDoc(doc(db, "content", "site"), updates, { merge: true });
  contentStatus.textContent = "All changes saved!";
  setTimeout(() => (contentStatus.textContent = ""), 2500);
});

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