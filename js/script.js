'use strict';

/* ============================================================
   BRASIL BATERIAS — v2 "Carga"
   WAAPI, IntersectionObserver, canvas, magnetic buttons,
   scroll-driven CSS com fallback JS
   ============================================================ */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- boot: sequência de carga ---------- */
const boot = document.getElementById('boot');
const bootFill = document.getElementById('bootFill');
const bootPct = document.getElementById('bootPct');

const endBoot = () => {
  document.body.removeAttribute('data-charging');
  playHeroIntro();
};

if (reduceMotion || sessionStorage.getItem('booted')) {
  endBoot();
} else {
  sessionStorage.setItem('booted', '1');
  let pct = 0;
  const step = () => {
    pct = Math.min(pct + 6 + Math.random() * 10, 100);
    bootFill.style.width = `${pct}%`;
    bootPct.textContent = `${Math.round(pct)}%`;
    if (pct < 100) setTimeout(step, 55);
    else setTimeout(endBoot, 220);
  };
  step();
}

/* ---------- hero: título por caractere (WAAPI) ---------- */
const heroTitle = document.getElementById('heroTitle');

const splitChars = (el) => {
  el.querySelectorAll('.line').forEach((line) => {
    const words = line.textContent.trim().split(/\s+/);
    line.textContent = '';
    words.forEach((word, wi) => {
      const w = document.createElement('span');
      w.className = 'word';
      [...word].forEach((ch) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch;
        w.appendChild(span);
      });
      line.appendChild(w);
      if (wi < words.length - 1) line.appendChild(document.createTextNode(' '));
    });
  });
};

function playHeroIntro() {
  if (reduceMotion) return;
  splitChars(heroTitle);
  heroTitle.querySelectorAll('.char').forEach((char, i) => {
    char.animate(
      [
        { transform: 'translateY(110%) rotate(6deg)', opacity: 0 },
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      ],
      {
        duration: 700,
        delay: 120 + i * 22,
        easing: 'cubic-bezier(.22, 1.4, .36, 1)',
        fill: 'backwards',
      }
    );
  });
  animateVolts();
}

/* ---------- multímetro: leitura sobe até 12.6V ---------- */
const voltDigits = document.getElementById('voltDigits');
const meterStatus = document.getElementById('meterStatus');

function animateVolts() {
  const target = 12.6;
  const duration = reduceMotion ? 0 : 1800;
  const start = performance.now();

  const frame = (now) => {
    const t = duration ? Math.min((now - start) / duration, 1) : 1;
    const eased = 1 - Math.pow(1 - t, 4);
    voltDigits.textContent = (eased * target).toFixed(1).padStart(4, '0');
    if (t < 1) requestAnimationFrame(frame);
    else meterStatus.innerHTML = '<i class="led"></i> CARREGADA';
  };
  requestAnimationFrame(frame);
}
if (reduceMotion) { voltDigits.textContent = '12.6'; meterStatus.innerHTML = '<i class="led"></i> CARREGADA'; }

/* ---------- medidor de carga do header ---------- */
const header = document.getElementById('header');
const chargePct = document.getElementById('chargePct');
const chargeFill = document.getElementById('chargeFill');
const nativeScrollTimeline = CSS.supports('animation-timeline: scroll()');

const onScroll = () => {
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  const pct = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
  chargePct.textContent = `${pct}%`;
  if (!nativeScrollTimeline) chargeFill.style.width = `${pct}%`;
  header.classList.toggle('is-scrolled', window.scrollY > 30);
};
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- menu mobile ---------- */
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

burger.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', (e) => {
  if (e.target.matches('.nav__link')) {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }
});

/* ---------- scrollspy ---------- */
const spyTargets = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav__link')];

const spyIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const link = navLinks.find((a) => a.hash === `#${entry.target.id}`);
      if (!link) return;
      navLinks.forEach((a) => a.classList.remove('is-active'));
      link.classList.add('is-active');
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);
spyTargets.forEach((s) => spyIO.observe(s));

/* ---------- reveals com stagger ---------- */
const revealEls = document.querySelectorAll('[data-reveal]');
const revealIO = new IntersectionObserver(
  (entries, io) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
);
revealEls.forEach((el, i) => {
  el.style.setProperty('--d', `${(i % 4) * 0.07}s`);
  revealIO.observe(el);
});

/* ---------- finale: estado "100%" no medidor via :has() ---------- */
const finale = document.getElementById('finale');
new IntersectionObserver(
  (entries) => entries.forEach((e) => finale.classList.toggle('is-onscreen', e.isIntersecting)),
  { threshold: 0.3 }
).observe(finale);

/* ---------- faíscas em canvas no hero ---------- */
const canvas = document.getElementById('sparks');

if (canvas && !reduceMotion) {
  const ctx = canvas.getContext('2d');
  let w, h, sparks = [], raf;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = rect.width; h = rect.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const spawn = () => ({
    x: Math.random() * w,
    y: h + 10,
    vx: (Math.random() - 0.5) * 0.35,
    vy: -(0.4 + Math.random() * 0.9),
    r: 0.6 + Math.random() * 1.8,
    life: 1,
    decay: 0.002 + Math.random() * 0.004,
    hue: Math.random() < 0.85 ? 46 : 210, // amarelo, com azuis raros
  });

  const loop = () => {
    ctx.clearRect(0, 0, w, h);
    if (sparks.length < 70 && Math.random() < 0.5) sparks.push(spawn());

    sparks.forEach((s) => {
      s.x += s.vx; s.y += s.vy; s.life -= s.decay;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${s.hue} 95% 62% / ${s.life * 0.7})`;
      ctx.fill();
    });
    sparks = sparks.filter((s) => s.life > 0 && s.y > -20);
    raf = requestAnimationFrame(loop);
  };

  resize();
  addEventListener('resize', resize, { passive: true });

  // só anima com o hero visível — economiza bateria (a do usuário)
  new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(loop); }
      else { cancelAnimationFrame(raf); raf = null; }
    });
  }).observe(canvas);
}

/* ---------- botões magnéticos ---------- */
if (finePointer && !reduceMotion) {
  document.querySelectorAll('[data-magnetic]').forEach((btn) => {
    const strength = 0.35;
    btn.addEventListener('pointermove', (e) => {
      const rect = btn.getBoundingClientRect();
      const dx = e.clientX - rect.left - rect.width / 2;
      const dy = e.clientY - rect.top - rect.height / 2;
      btn.style.translate = `${dx * strength}px ${dy * strength}px`;
    });
    btn.addEventListener('pointerleave', () => {
      btn.animate(
        [{ translate: btn.style.translate }, { translate: '0px 0px' }],
        { duration: 450, easing: 'cubic-bezier(.22, 1.6, .36, 1)' }
      );
      btn.style.translate = '0px 0px';
    });
  });
}

/* ---------- rota da entrega: ponto viajando no fio ---------- */
const wirePath = document.getElementById('wirePath');
const wireDot = document.getElementById('wireDot');

if (wirePath && wireDot && !reduceMotion) {
  const len = wirePath.getTotalLength();
  let t = 0, wireRaf;

  const move = () => {
    t = (t + 0.0022) % 1;
    const p = wirePath.getPointAtLength(t * len);
    wireDot.setAttribute('cx', p.x);
    wireDot.setAttribute('cy', p.y);
    wireRaf = requestAnimationFrame(move);
  };

  new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { if (!wireRaf) wireRaf = requestAnimationFrame(move); }
      else { cancelAnimationFrame(wireRaf); wireRaf = null; }
    });
  }).observe(wirePath.closest('svg'));
} else if (wireDot) {
  wireDot.setAttribute('cx', 600);
  wireDot.setAttribute('cy', 52);
}

/* ---------- status aberto/fechado + relógio ---------- */
const statusLine = document.getElementById('statusLine');
const statusText = document.getElementById('statusText');
const bigTime = document.getElementById('bigTime');

const tickClock = () => {
  const now = new Date();
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();

  let open = false;
  if (day >= 1 && day <= 5) open = mins >= 480 && mins < 1080;
  else if (day === 6) open = mins >= 480 && mins < 780;

  statusLine.classList.toggle('is-closed', !open);
  statusText.textContent = open ? 'ABERTO AGORA — PODE CHAMAR' : 'FECHADO — DEIXE SUA MENSAGEM';

  bigTime.textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};
tickClock();
setInterval(tickClock, 15000);

/* ---------- ano ---------- */
document.getElementById('year').textContent = new Date().getFullYear();
