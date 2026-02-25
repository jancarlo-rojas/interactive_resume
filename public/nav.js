document.addEventListener('DOMContentLoaded', () => {
  const navbars = document.querySelectorAll('.navbar');
  if (!navbars.length) return;

  let overlay = document.querySelector('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  const navConfigs = [];

  const closeAllMenus = () => {
    navConfigs.forEach(({ menu, toggle }) => {
      menu.classList.remove('show');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.classList.remove('is-open');
      }
    });
    document.body.classList.remove('nav-open');
    overlay.classList.remove('show');
  };

  const openMenu = (menu, toggle) => {
    closeAllMenus();
    menu.classList.add('show');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.classList.add('is-open');
    document.body.classList.add('nav-open');
    overlay.classList.add('show');
  };

  navbars.forEach((nav) => {
    const toggle = nav.querySelector('.nav-toggle');
    const menu = nav.querySelector('.nav-menu');
    if (!toggle || !menu) return;

    navConfigs.push({ menu, toggle });

    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (menu.classList.contains('show')) {
        closeAllMenus();
      } else {
        openMenu(menu, toggle);
      }
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => closeAllMenus());
    });
  });

  overlay.addEventListener('click', closeAllMenus);

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeAllMenus();
    }
  });
});
