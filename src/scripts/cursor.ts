/** Cursor personalizado: ponto + anel que cresce sobre links e cards. Só desktop com mouse. */
import { loadGsap } from './gsap';
import { isDesktopPointer, prefersReducedMotion } from './motion';

const HOVER_SELECTOR = 'a, button, summary, label, [data-cursor="hover"]';
let started = false;

export async function initCursor(): Promise<void> {
  if (started || prefersReducedMotion() || !isDesktopPointer()) return;
  const cursor = document.querySelector<HTMLElement>('[data-cursor-root]');
  const dot = cursor?.querySelector<HTMLElement>('.cursor__dot');
  const ring = cursor?.querySelector<HTMLElement>('.cursor__ring');
  if (!cursor || !dot || !ring) return;
  started = true;

  const { gsap } = await loadGsap();
  const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });

  document.documentElement.classList.add('has-cursor');
  cursor.classList.add('is-hidden');

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      cursor.classList.remove('is-hidden');
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
      const overInteractive = (e.target as Element | null)?.closest(HOVER_SELECTOR);
      cursor.classList.toggle('is-hover', Boolean(overInteractive));
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
}
