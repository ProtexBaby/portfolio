(function () {
  'use strict';

  // Must match the translateY distance of the star-drift keyframes in style.css.
  const STAR_FIELD_HEIGHT = 2000;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const TOAST_DURATION = 3000;

  let toastTimer;

  function randomStarShadows(count, fieldWidth) {
    const shadows = [];
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * fieldWidth);
      const y = Math.floor(Math.random() * STAR_FIELD_HEIGHT);
      shadows.push(`${x}px ${y}px #fff`);
    }
    return shadows.join(', ');
  }

  function initStars() {
    const fieldWidth = Math.max(window.screen.width, 2000);
    document.querySelectorAll('[data-stars]').forEach((layer) => {
      layer.style.boxShadow = randomStarShadows(Number(layer.dataset.stars), fieldWidth);
    });
  }

  function initTabs() {
    const views = document.querySelectorAll('[data-view]');
    const links = document.querySelectorAll('[data-tab]');
    const names = Array.from(views, (view) => view.dataset.view);

    function showFromHash() {
      const hash = window.location.hash.slice(1);
      const current = names.includes(hash) ? hash : names[0];

      views.forEach((view) => {
        view.hidden = view.dataset.view !== current;
      });
      links.forEach((link) => {
        const isActive = link.dataset.tab === current;
        link.classList.toggle('is-active', isActive);
        if (isActive) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    window.addEventListener('hashchange', showFromHash);
    showFromHash();
  }

  // The marquee scrolls each group by its own width, so it needs a second copy to fill the gap.
  function initSkills() {
    const group = document.querySelector('.skills__group');
    if (!group) return;

    const clone = group.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    group.after(clone);
  }

  function showToast(message, type) {
    const toast = document.querySelector('.toast');
    toast.textContent = message;
    toast.className = `toast toast--${type} is-visible`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), TOAST_DURATION);
  }

  function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const fields = ['subject', 'full_name', 'email', 'message'].map((name) => form.elements[name]);

    function isValid(input) {
      const value = input.value.trim();
      return value !== '' && (input.name !== 'email' || EMAIL_PATTERN.test(value));
    }

    fields.forEach((input) => {
      input.addEventListener('input', () => input.classList.remove('is-invalid'));
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const invalid = fields.filter((input) => !isValid(input));
      fields.forEach((input) => input.classList.toggle('is-invalid', invalid.includes(input)));
      if (invalid.length > 0) {
        invalid[0].focus();
        showToast('Please fill in every field with a valid value.', 'error');
        return;
      }

      const [subject, fullName, email, message] = fields.map((input) => input.value.trim());
      const body = `${message}\n\n${fullName}\n${email}`;
      window.location.href =
        `${form.getAttribute('action')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      showToast('Opening your email app…', 'success');
    });
  }

  initStars();
  initTabs();
  initSkills();
  initContactForm();
})();
