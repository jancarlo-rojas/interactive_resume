document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  const container = document.querySelector('.nav-container');

  if (!toggle || !menu || !container) return;

  // ensure closed on load
  menu.classList.remove('show');
  toggle.setAttribute('aria-expanded', 'false');

  const toggleHandler = (e) => {
    e.stopPropagation && e.stopPropagation(); // prevent document click handler from firing
    const opened = menu.classList.toggle('show');
    toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
  };
  toggle.addEventListener('click', toggleHandler);
  toggle.addEventListener('touchend', toggleHandler);

  // Close menu when clicking a link
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // add a visible close button inside the menu for small screens
  if (!menu.querySelector('.nav-close')) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'nav-close';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.innerHTML = '×';
    closeBtn.addEventListener('click', () => {
      menu.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
    });
    closeBtn.addEventListener('touchend', () => {
      menu.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
    });
    menu.insertAdjacentElement('afterbegin', closeBtn);
  }

  // Close menu when clicking outside
  const outsideHandler = (e) => {
    if (!menu.classList.contains('show')) return;
    if (e.target.closest && e.target.closest('.nav-container')) return;
    menu.classList.remove('show');
    toggle.setAttribute('aria-expanded', 'false');
  };
  document.addEventListener('click', outsideHandler);
  document.addEventListener('touchstart', outsideHandler);

  // on resize, ensure menu state matches desktop layout
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      menu.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
});
