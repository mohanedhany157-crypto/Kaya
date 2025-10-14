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
                // If a link in the mobile menu is clicked, hide the menu
                navMenu.classList.remove('active');
            });
        });
    }
}

// 3. Contact Form Submission (NOW REAL - not simulated)
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    // Get the submit button to manage its disabled state
    const submitButton = document.querySelector('.btn-submit'); 

    if (contactForm && formStatus && submitButton) {
        
        // Change to async function to use await with fetch
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent the default form submission (page reload)
            
            // --- 1. INITIAL STATE & LOADING ---
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            formStatus.textContent = 'Sending your message to our team...';
            formStatus.style.color = '#6C5CE7'; // Secondary accent color for status

            // Gather form data from input elements
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                message: document.getElementById('message').value
            };

            try {
                // --- 2. SEND DATA TO SERVER ---
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                // Get the JSON response from the server
                const data = await response.json();

                // --- 3. HANDLE RESPONSE ---
                if (response.ok) {
                    // Success (HTTP 200)
                    formStatus.textContent = data.message || 'Woohoo! Message sent successfully! We will read it right away.';
                    formStatus.style.color = '#4CAF50'; // Green for success
                    contactForm.reset(); // Clear the form fields
                } else {
                    // Server-side error (HTTP 400 or 500)
                    formStatus.textContent = data.error || 'Oops! Something went wrong on the server. Please check your data and try again.';
                    formStatus.style.color = '#FF6B6B'; // Red for error
                }

            } catch (error) {
                // --- 4. HANDLE NETWORK ERRORS ---
                console.error('Network Error during form submission:', error);
                formStatus.textContent = 'A network error occurred. Please check your connection and try again.';
                formStatus.style.color = '#FF6B6B'; // Red for error
            } finally {
                // --- 5. CLEAN UP ---
                // Re-enable the button and restore text
                submitButton.disabled = false;
                submitButton.textContent = 'Send to Kaya Team';
            }
        });
    }
}

// Initialize all functions when the page loads
document.addEventListener('DOMContentLoaded', () => {
    setDynamicYear();
    setupMobileMenu();
    setupContactForm(); // Now runs the real submission logic
});