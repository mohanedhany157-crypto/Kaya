/**
 * ======================================================
 * JAVASCRIPT FOR KAYA KIDS LANDING PAGE INTERACTIVITY
 * ======================================================
 */

// 1. Dynamic Year Update for the Footer
function setDynamicYear() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// 2. Mobile Menu Toggle Logic
function setupMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      // Toggles the 'active' class on the navigation menu
      navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked (for better mobile UX)
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }
}

// 3. Contact Form Submission Simulation
function setupContactForm() {
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Prevent the default form submission (page reload)

      // Display initial sending message
      formStatus.textContent = 'Sending your message to our team...';
      formStatus.style.color = '#6C5CE7'; // Secondary accent color for status

      // Simulate a network delay (1.5 seconds)
      setTimeout(() => {
        // Simulate a successful submission
        const success = true; // For a demo, we'll assume it always succeeds

        if (success) {
          formStatus.textContent = 'Woohoo! Message sent successfully! We will read it right away.';
          formStatus.style.color = '#4CAF50'; // Green for success
          contactForm.reset(); // Clear the form fields
        } else {
          // This block would handle API errors in a real app
          formStatus.textContent = 'Oops! Something went wrong. Please try again.';
          formStatus.style.color = '#FF6B6B'; // Red for error
        }
      }, 1500);
    });
  }
}

// Initialize all functions when the page loads
document.addEventListener('DOMContentLoaded', () => {
  setDynamicYear();
  setupMobileMenu();
  setupContactForm();
});
