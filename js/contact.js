import { db } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");

contactForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = contactForm.name.value;
  const email = contactForm.email.value;
  const phone = contactForm.phone.value;
  const message = contactForm.message.value;

  contactStatus.textContent = "Sending...";

  try {
    await addDoc(collection(db, "messages"), {
      name, email, phone, message,
      timestamp: serverTimestamp()
    });
    contactForm.reset();
    contactStatus.textContent = "Message sent! We'll get back to you soon.";
  } catch (error) {
    console.error(error);
    contactStatus.textContent = "Something went wrong. Please try again.";
  }
});