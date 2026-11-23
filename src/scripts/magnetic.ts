/** Botões magnéticos com gsap.quickTo. Só desktop com mouse. */
import { loadGsap } from './gsap';
import { isDesktopPointer, prefersReducedMotion } from './motion';

export async function initMagnetic(root: ParentNode = document): Promise<void> {
  if (prefersReducedMotion() || !isDesktopPointer()) return;
  const items = [...root.querySelectorAll<HTMLElement>('[data-magnetic]:not([data-magnetic-ready])')];
  if (!items.length) return;
  const { gsap } = await loadGsap();

  for (const el of items) {
    el.dataset.magneticReady = '';
    const strength = Number(el.dataset.magnetic || 0.35);
    const inner = el.querySelector<HTMLElement>('[data-magnetic-inner]');
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const ixTo = inner ? gsap.quickTo(inner, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' }) : null;
    const iyTo = inner ? gsap.quickTo(inner, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' }) : null;

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
      ixTo?.(dx * strength * 0.4);
      iyTo?.(dy * strength * 0.4);
    });
    el.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
      ixTo?.(0);
      iyTo?.(0);
    });
  }
}
