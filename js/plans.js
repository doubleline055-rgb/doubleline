import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function loadPlans() {
  const plansGrid = document.getElementById("plansGrid");
  if (!plansGrid) return;

  try {
    const snapshot = await getDocs(collection(db, "plans"));

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
  } catch (error) {
    console.error("Error loading plans:", error);
    plansGrid.innerHTML = "<p style='color: var(--cream);'>Couldn't load plans right now.</p>";
  }
}

loadPlans();