const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');
const cursorLight = document.querySelector('.cursor-light');

menuButton?.addEventListener('click', () => {
  const open = nav?.classList.toggle('open') ?? false;
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  });
});

const updateHeader = () => {
  header?.classList.toggle('scrolled', window.scrollY > 20);
};
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (!coarsePointer && cursorLight) {
  window.addEventListener('pointermove', (event) => {
    cursorLight.style.left = `${event.clientX}px`;
    cursorLight.style.top = `${event.clientY}px`;
    document.body.classList.add('pointer-active');
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', () => {
    document.body.classList.remove('pointer-active');
  });
}

const revealItems = document.querySelectorAll('.reveal');

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.08
  });

  revealItems.forEach((item) => revealObserver.observe(item));
}

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];

if ('IntersectionObserver' in window && sections.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    const id = visible.target.id;
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.toggleAttribute('aria-current', active);
    });
  }, {
    rootMargin: '-25% 0px -60% 0px',
    threshold: [0.01, 0.15, 0.4]
  });

  sections.forEach((section) => sectionObserver.observe(section));
}

window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  nav?.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
});
