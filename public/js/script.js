/**
 * ======================================================
 * JAVASCRIPT FOR KAYA LANDING PAGE INTERACTIVITY
 * ======================================================
 */

// 1. Dynamic Year Update for Footer
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

// 3. Contact Form Submission + WhatsApp Redirect
function setupContactForm() {
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const submitButton = document.querySelector('.btn-submit');

  if (contactForm && formStatus && submitButton) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
      formStatus.textContent = 'Sending your message to our team...';
      formStatus.style.color = '#6C5CE7';

      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        message: document.getElementById('message').value
      };

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
          formStatus.textContent = 'Thanks! Redirecting you to WhatsApp...';
          formStatus.style.color = '#4CAF50';

          // ✅ WhatsApp redirect
          setTimeout(() => {
            const encodedMessage = encodeURIComponent(
              `Hi Kaya Team! 👋\nMy name is ${formData.name}.\nEmail: ${formData.email}\nPhone: ${formData.phone || 'N/A'}\n\nMessage:\n${formData.message}`
            );
            window.open(`https://wa.me/601116898234?text=${encodedMessage}`, '_blank');
          }, 1000);

          contactForm.reset();
        } else {
          formStatus.textContent = data.error || 'Oops! Something went wrong on the server.';
          formStatus.style.color = '#FF6B6B';
        }

      } catch (error) {
        console.error('Network Error during form submission:', error);
        formStatus.textContent = 'A network error occurred. Please try again.';
        formStatus.style.color = '#FF6B6B';
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Send to Kaya Team';
      }
    });
  }
}

// Initialize all scripts
document.addEventListener('DOMContentLoaded', () => {
  setDynamicYear();
  setupMobileMenu();
  setupContactForm();
});
