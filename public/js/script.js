/**
 * ======================================================
 * JAVASCRIPT FOR KAYA STORE & SITE INTERACTIVITY
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
    // Toggle menu on hamburger click
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      
      // Optional: Switch icon between bars and X
      const icon = menuToggle.querySelector('i');
      if (icon) {
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
      }
    });

    // Close menu when a link is clicked (better user experience)
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        // Reset icon
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
      });
    });
  }
}

// 3. Store Interaction Placeholders (New for Store Design)
function setupStoreInteractions() {
  // Handle "Add to Cart" Button Clicks
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  
  addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault(); // Stops page jump if it's an anchor tag
      // Simple feedback for the user
      alert('Great choice! Item added to your cart. 🛒');
    });
  });

  // Handle Main Cart Icon Click
  const cartIcon = document.querySelector('.cart-icon');
  if (cartIcon) {
    cartIcon.addEventListener('click', () => {
      alert('Your cart is currently empty. Start shopping! 🛍️');
    });
  }
}

// Initialize All Functions when DOM is Ready
document.addEventListener('DOMContentLoaded', () => {
  setDynamicYear();
  setupMobileMenu();
  setupStoreInteractions();
});