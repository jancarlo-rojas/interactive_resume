document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.navbar').forEach((nav) => {
    const toggle = nav.querySelector('.nav-toggle');
    const mobileMenu = nav.querySelector('.mobile-menu');
    if (!toggle || !mobileMenu) return;

    const closeBtn = mobileMenu.querySelector('.mobile-close');
    const links = mobileMenu.querySelectorAll('a');

    const openMenu = () => {
      mobileMenu.classList.add('open');
      document.body.classList.add('nav-open');
      toggle.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
      mobileMenu.classList.remove('open');
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
      if (mobileMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    links.forEach((link) => link.addEventListener('click', closeMenu));

    mobileMenu.addEventListener('click', (event) => {
      if (event.target === mobileMenu) closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) closeMenu();
    });
  });
});
