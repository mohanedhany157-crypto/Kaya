/**
 * ======================================================
 * JAVASCRIPT FOR KAYA LANDING PAGE INTERACTIVITY
 * ======================================================
 */

// 1. Dynamic Year Update
function setDynamicYear() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// 2. Mobile Menu Toggle
function setupMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }
}

// Initialize Functions
document.addEventListener('DOMContentLoaded', () => {
  setDynamicYear();
  setupMobileMenu();
});
