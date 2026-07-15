import { db } from "./firebase-config.js";
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const faqList = document.getElementById("faqList");

if (faqList) {
  const q = query(collection(db, "faqs"), orderBy("order"));

  onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      faqList.innerHTML = "<p>No FAQs added yet.</p>";
      return;
    }

    faqList.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const item = document.createElement("details");
      item.className = "faq__item";
      item.innerHTML = `
        <summary>${data.question}</summary>
        <p>${data.answer}</p>
      `;
      faqList.appendChild(item);
    });
  }, (error) => {
    console.error("Error loading FAQs:", error);
    faqList.innerHTML = "<p>Couldn't load FAQs right now.</p>";
  });
}