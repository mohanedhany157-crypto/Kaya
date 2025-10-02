// script.js
document.addEventListener('DOMContentLoaded', () => {
  // fill current year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // mobile menu toggle
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.querySelector('.main-nav');
  menuBtn?.addEventListener('click', () => {
    const open = nav.style.display !== 'flex';
    nav.style.display = open ? 'flex' : 'none';
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  // contact form submit
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Sending...';

    const data = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value
    };

    try {
      const res = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error('Network response not ok');
      const json = await res.json();
      status.textContent = json.message || 'Message sent — thank you!';
      form.reset();
    } catch (err) {
      status.textContent = 'There was a problem sending the message.';
      console.error(err);
    }
  });
});
