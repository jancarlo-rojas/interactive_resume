document.addEventListener('DOMContentLoaded', () => {
  const navbars = document.querySelectorAll('.navbar');

  navbars.forEach((nav) => {
    const toggle = nav.querySelector('.nav-toggle');
    const menu = nav.querySelector('.nav-menu');
    if (!toggle || !menu) return;

    const closeMenu = () => {
      menu.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.classList.remove('is-open');
    };

    const openMenu = () => {
      menu.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.classList.add('is-open');
    };

    closeMenu();

    const handleToggle = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (menu.classList.contains('show')) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    toggle.addEventListener('click', handleToggle);

    const closeTargets = menu.querySelectorAll('a, .nav-close');
    closeTargets.forEach((el) => {
      el.addEventListener('click', () => {
        closeMenu();
      });
    });

    document.addEventListener('click', (event) => {
      if (!menu.classList.contains('show')) return;
      if (nav.contains(event.target)) return;
      closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  });
});
