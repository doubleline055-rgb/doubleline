// ===== Mobile nav toggle =====
const navBurger = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');

navBurger?.addEventListener('click', () => {
  navLinks.classList.toggle('is-open');
});




// ===== Popup close =====
const popup = document.getElementById('popup');
const popupClose = document.getElementById('popupClose');
popupClose?.addEventListener('click', () => {
  popup.hidden = true;
});

// Popup is hidden by default. Later, this will check Firestore
// for an "active" flag + text set by the admin CMS.