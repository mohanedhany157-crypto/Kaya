/* --- script.js --- */

/* --- MOBILE MENU TOGGLE --- */
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if(menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
});

/* --- SMOOTH SCROLL FOR ANCHOR LINKS --- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if(target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }

    // Close mobile menu after click
    const navMenu = document.querySelector('.nav-menu');
    if(navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
    }
  });
});

/* --- OPTIONAL: ADD HOVER ANIMATION TO LINKTREE BUTTONS --- */
const links = document.querySelectorAll('.link-btn, .order-btn, .btn');

links.forEach(link => {
  link.addEventListener('mouseenter', () => {
    link.style.transform = 'translateY(-4px)';
    link.style.transition = 'transform 0.25s ease';
  });

  link.addEventListener('mouseleave', () => {
    link.style.transform = 'translateY(0)';
  });
});

/* --- OPTIONAL: ADD SCROLL REVEAL EFFECT FOR GALLERY ITEMS --- */
const galleryItems = document.querySelectorAll('.gallery-item-full, .feature-card, .pitch-block');

const revealOnScroll = () => {
  const windowHeight = window.innerHeight;
  galleryItems.forEach(item => {
    const elementTop = item.getBoundingClientRect().top;
    const revealPoint = 150; // distance from bottom of screen
    if(elementTop < windowHeight - revealPoint) {
      item.classList.add('active');
    }
  });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

/* Add CSS for .active if not in CSS yet:
   .gallery-item-full.active, .feature-card.active, .pitch-block.active {
       opacity: 1;
       transform: translateY(0);
       transition: all 0.6s ease-out;
   }
   Initial CSS:
   .gallery-item-full, .feature-card, .pitch-block {
       opacity: 0;
       transform: translateY(50px);
   }
*/
