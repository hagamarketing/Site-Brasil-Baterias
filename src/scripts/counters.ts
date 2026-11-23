/** Números que contam do zero ao entrar na tela (sem GSAP, só requestAnimationFrame). */
import { prefersReducedMotion } from './motion';

const fmt = (value: number, decimals: number) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

function render(el: HTMLElement, value: number) {
  const decimals = Number(el.dataset.decimals ?? 0);
  el.textContent = `${el.dataset.prefix ?? ''}${fmt(value, decimals)}${el.dataset.suffix ?? ''}`;
}

export function animateCounter(el: HTMLElement, duration = 1600): void {
  const to = Number(el.dataset.countTo);
  if (Number.isNaN(to)) return;
  if (prefersReducedMotion()) return render(el, to);
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 4);
    render(el, to * eased);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** Observa todos os [data-count-to] dentro de root e anima quando aparecem. */
export function initCounters(root: ParentNode = document): void {
  const els = [...root.querySelectorAll<HTMLElement>('[data-count-to]')];
  if (!els.length) return;
  if (prefersReducedMotion()) return;
  for (const el of els) render(el, 0);
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        const el = entry.target as HTMLElement;
        // Seções com controle próprio (ex.: cases no desktop) marcam o contador como manual
        if (el.dataset.counterManual === undefined) animateCounter(el);
      }
    },
    { threshold: 0.6 },
  );
  els.forEach((el) => io.observe(el));
}
