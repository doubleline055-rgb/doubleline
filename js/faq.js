import { db } from "./firebase-config.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function loadFAQs() {
  const faqList = document.getElementById("faqList");
  if (!faqList) return;

  try {
    const q = query(collection(db, "faqs"), orderBy("order"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      faqList.innerHTML = "<p>No FAQs added yet.</p>";
      return;
    }

    faqList.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const item = document.createElement("details");
      item.className = "faq__item";
      item.innerHTML = `
        <summary>${data.question}</summary>
        <p>${data.answer}</p>
      `;
      faqList.appendChild(item);
    });
  } catch (error) {
    console.error("Error loading FAQs:", error);
    faqList.innerHTML = "<p>Couldn't load FAQs right now.</p>";
  }
}

loadFAQs();