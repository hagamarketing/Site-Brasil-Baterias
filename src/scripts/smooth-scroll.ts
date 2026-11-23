/**
 * Lenis + ScrollTrigger. Só no desktop com mouse e sem prefers-reduced-motion:
 * no celular a rolagem nativa é mais rápida e mais natural.
 */
import type Lenis from 'lenis';
import { loadGsap } from './gsap';
import { isDesktopPointer, prefersReducedMotion } from './motion';

let lenis: Lenis | null = null;

function headerOffset(): number {
  return -(document.querySelector<HTMLElement>('[data-header]')?.offsetHeight ?? 72);
}

export function scrollToTarget(target: HTMLElement | number): void {
  if (lenis) {
    lenis.scrollTo(target, { offset: typeof target === 'number' ? 0 : headerOffset() });
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target });
  } else {
    target.scrollIntoView({ block: 'start' });
  }
}

export async function initSmoothScroll(): Promise<void> {
  if (lenis || prefersReducedMotion() || !isDesktopPointer()) return;
  const [{ default: LenisCtor }, { gsap, ScrollTrigger }] = await Promise.all([import('lenis'), loadGsap()]);
  lenis = new LenisCtor({ lerp: 0.1, wheelMultiplier: 1, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.addEventListener('astro:after-swap', () => {
    lenis?.resize();
    lenis?.scrollTo(0, { immediate: true });
  });
}

/** Âncoras internas ("/#servicos") com rolagem suave e compensação do menu fixo. */
export function initAnchorLinks(): void {
  document.addEventListener(
    'click',
    (event) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href*="#"]');
      if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey) return;
      const url = new URL(link.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      history.pushState(null, '', url.hash);
      scrollToTarget(target);
      target.focus({ preventScroll: true });
    },
    { capture: true },
  );
}
