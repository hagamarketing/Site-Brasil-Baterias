'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Header: scroll state + progress bar ---------- */
const header = document.getElementById('header');
const progressBar = document.getElementById('progressBar');
const backToTop = document.getElementById('backToTop');

const onScroll = () => {
  const y = window.scrollY;
  header.classList.toggle('is-scrolled', y > 40);

  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - doc.clientHeight;
  const pct = scrollable > 0 ? (y / scrollable) * 100 : 0;
  progressBar.style.width = `${pct}%`;

  backToTop.classList.toggle('is-visible', y > 600);
};
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
});

/* ---------- Mobile nav ---------- */
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

const closeNav = () => {
  nav.classList.remove('is-open');
  hamburger.classList.remove('is-active');
  hamburger.setAttribute('aria-expanded', 'false');
};

hamburger.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  hamburger.classList.toggle('is-active', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

nav.querySelectorAll('.nav__link').forEach((link) => link.addEventListener('click', closeNav));

/* ---------- Scrollspy: highlight active nav link ---------- */
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav__link')];

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const link = navLinks.find((a) => a.getAttribute('href') === `#${entry.target.id}`);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach((a) => a.classList.remove('is-active'));
        link.classList.add('is-active');
      }
    });
  },
  { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
);
sections.forEach((section) => spyObserver.observe(section));

/* ---------- Scroll reveal animations ---------- */
const revealObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
);

document.querySelectorAll('[data-reveal]').forEach((el, i) => {
  el.style.transitionDelay = prefersReducedMotion ? '0s' : `${Math.min(i % 4, 3) * 0.08}s`;
  revealObserver.observe(el);
});

/* ---------- Animated counters ---------- */
const animateCount = (el) => {
  const target = Number(el.dataset.count);
  if (prefersReducedMotion) { el.textContent = target; return; }
  const duration = 1400;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const countObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll('.stat__num').forEach((el) => countObserver.observe(el));

/* ---------- Hero card 3D tilt ---------- */
const tiltCard = document.getElementById('tiltCard');
if (tiltCard && !prefersReducedMotion && matchMedia('(hover: hover)').matches) {
  const maxTilt = 8;
  tiltCard.addEventListener('pointermove', (e) => {
    const rect = tiltCard.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    tiltCard.style.transform = `rotateY(${px * maxTilt * 2}deg) rotateX(${-py * maxTilt * 2}deg)`;
  });
  tiltCard.addEventListener('pointerleave', () => {
    tiltCard.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });
}

/* ---------- Store open/closed status ---------- */
const statusBadge = document.getElementById('statusBadge');
const statusText = document.getElementById('statusText');

const updateStoreStatus = () => {
  const now = new Date();
  const day = now.getDay(); // 0 Sun - 6 Sat
  const minutes = now.getHours() * 60 + now.getMinutes();

  let open = false;
  if (day >= 1 && day <= 5) open = minutes >= 8 * 60 && minutes < 18 * 60;
  else if (day === 6) open = minutes >= 8 * 60 && minutes < 13 * 60;

  statusBadge.classList.toggle('is-closed', !open);
  statusText.textContent = open ? 'Aberto agora' : 'Fechado no momento';
};
updateStoreStatus();
setInterval(updateStoreStatus, 60000);

/* ---------- Analog clock ---------- */
const hourHand = document.getElementById('hourHand');
const minHand = document.getElementById('minHand');
const ticksGroup = document.getElementById('clockTicks');

if (ticksGroup) {
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 * Math.PI) / 180;
    const x1 = 100 + Math.sin(angle) * 78;
    const y1 = 100 - Math.cos(angle) * 78;
    const x2 = 100 + Math.sin(angle) * 68;
    const y2 = 100 - Math.cos(angle) * 68;
    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tick.setAttribute('x1', x1); tick.setAttribute('y1', y1);
    tick.setAttribute('x2', x2); tick.setAttribute('y2', y2);
    tick.setAttribute('stroke', 'rgba(255,255,255,.4)');
    tick.setAttribute('stroke-width', i % 3 === 0 ? '3' : '1.5');
    ticksGroup.appendChild(tick);
  }
}

const updateClock = () => {
  const now = new Date();
  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const hourAngle = (h + m / 60) * 30;
  const minAngle = m * 6;

  if (hourHand) hourHand.setAttribute('transform', `rotate(${hourAngle} 100 100)`);
  if (minHand) minHand.setAttribute('transform', `rotate(${minAngle} 100 100)`);
};
updateClock();
setInterval(updateClock, 1000 * 30);

/* ---------- Footer year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();
