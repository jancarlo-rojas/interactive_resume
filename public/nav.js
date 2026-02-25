document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  const container = document.querySelector('.nav-container');

  if (!toggle || !menu || !container) return;

  // ensure closed on load
  menu.classList.remove('show');
  toggle.setAttribute('aria-expanded', 'false');

  toggle.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent document click handler from firing
    const opened = menu.classList.toggle('show');
    toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
  });

  // Close menu when clicking a link
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('show')) return;
    if (e.target.closest('.nav-container')) return;
    menu.classList.remove('show');
    toggle.setAttribute('aria-expanded', 'false');
  });

  // on resize, ensure menu state matches desktop layout
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      menu.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
});
