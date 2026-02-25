document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.toggle('show');
  });

  // Close menu when clicking a link
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('show'));
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('show')) return;
    if (e.target.closest('.nav-container')) return;
    menu.classList.remove('show');
  });
});
