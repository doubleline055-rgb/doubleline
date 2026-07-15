import { db } from "./firebase-config.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const plansGrid = document.getElementById("plansGrid");

if (plansGrid) {
  onSnapshot(collection(db, "plans"), (snapshot) => {
    if (snapshot.empty) {
      plansGrid.innerHTML = "<p style='color: var(--cream);'>Plans coming soon.</p>";
      return;
    }

    plansGrid.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const card = document.createElement("div");
      card.className = "plan-card" + (data.featured ? " plan-card--featured" : "");
      card.innerHTML = `
        ${data.featured ? '<span class="plan-card__badge">Most Popular</span>' : ""}
        <h3>${data.name}</h3>
        <p class="plan-card__price">$${data.price}<span>/mo</span></p>
        <ul>
          ${(data.features || []).map((f) => `<li>${f}</li>`).join("")}
        </ul>
        <a href="#contact" class="btn ${data.featured ? "btn--amber" : "btn--outline"}">Order ${data.name}</a>
      `;
      plansGrid.appendChild(card);
    });
  }, (error) => {
    console.error("Error loading plans:", error);
    plansGrid.innerHTML = "<p style='color: var(--cream);'>Couldn't load plans right now.</p>";
  });
}