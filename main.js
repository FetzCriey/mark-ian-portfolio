const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');
const cursorLight = document.querySelector('.cursor-light');

const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
const menuFocusables = () => [menuButton, ...navLinks].filter(Boolean);

function closeMenu(restoreFocus = false) {
  if (!nav?.classList.contains('open')) return;
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
  if (restoreFocus) menuButton?.focus();
}

function openMenu() {
  if (!nav || !menuButton) return;
  nav.classList.add('open');
  menuButton.setAttribute('aria-expanded', 'true');
  document.body.classList.add('menu-open');
  navLinks[0]?.focus();
}

menuButton?.addEventListener('click', () => {
  nav?.classList.contains('open') ? closeMenu(false) : openMenu();
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => closeMenu(false));
});

document.addEventListener('pointerdown', (event) => {
  if (!nav?.classList.contains('open')) return;
  if (header?.contains(event.target)) return;
  closeMenu(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu(true);
    return;
  }

  if (event.key !== 'Tab' || !nav?.classList.contains('open')) return;

  const focusables = menuFocusables();
  if (!focusables.length) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

const updateHeader = () => {
  header?.classList.toggle('scrolled', window.scrollY > 20);
};
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (!coarsePointer && cursorLight && !reducedMotion) {
  let pointerX = 0;
  let pointerY = 0;
  let pointerFrame = 0;

  const paintPointer = () => {
    cursorLight.style.transform = `translate3d(calc(${pointerX}px - 50%), calc(${pointerY}px - 50%), 0)`;
    pointerFrame = 0;
  };

  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    document.body.classList.add('pointer-active');
    if (!pointerFrame) pointerFrame = requestAnimationFrame(paintPointer);
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', () => {
    document.body.classList.remove('pointer-active');
  });
}

const revealItems = [...document.querySelectorAll('.reveal')];

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const fold = window.innerHeight * 0.9;

  revealItems.forEach((item) => {
    if (item.getBoundingClientRect().top <= fold) {
      item.classList.add('is-visible');
    } else {
      item.classList.add('reveal-pending');
    }
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: '0px 0px -7% 0px',
    threshold: 0.06
  });

  revealItems
    .filter((item) => item.classList.contains('reveal-pending'))
    .forEach((item) => revealObserver.observe(item));
}

const sections = [...document.querySelectorAll('main section[id]')];

if ('IntersectionObserver' in window && sections.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${visible.target.id}`;
      if (active) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }, {
    rootMargin: '-22% 0px -62% 0px',
    threshold: [0.01, 0.15, 0.35]
  });

  sections.forEach((section) => sectionObserver.observe(section));
}
