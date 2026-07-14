// ===== Mobile nav toggle =====
const navBurger = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');

navBurger?.addEventListener('click', () => {
  navLinks.classList.toggle('is-open');
});

// ===== Contact form (placeholder — will connect to EmailJS/Formspree later) =====
const contactForm = document.getElementById('contactForm');
const contactStatus = document.getElementById('contactStatus');

contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  contactStatus.textContent = "This form isn't connected yet — we'll wire it up to send real emails next.";
});

// ===== Amazon link placeholder =====
const amazonLink = document.getElementById('amazonLink');
amazonLink?.addEventListener('click', (e) => {
  e.preventDefault();
  alert('Amazon product link goes here once he sends it.');
});

// ===== Popup close =====
const popup = document.getElementById('popup');
const popupClose = document.getElementById('popupClose');
popupClose?.addEventListener('click', () => {
  popup.hidden = true;
});

// Popup is hidden by default. Later, this will check Firestore
// for an "active" flag + text set by the admin CMS.