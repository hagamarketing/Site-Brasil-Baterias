/**
 * Ciclo de vida das ilhas de script. O site é uma única página (sem ClientRouter),
 * então cada seção se inicializa uma vez, quando o DOM está pronto.
 * `onCleanup` guarda o que precisa ser desfeito (observers, contextos do GSAP).
 */

type Cleanup = () => void;
const cleanups: Cleanup[] = [];

export function onCleanup(fn: Cleanup): void {
  cleanups.push(fn);
}

export function onPageLoad(init: () => void | Promise<void>): void {
  const run = () => void init();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
}

addEventListener('pagehide', () => {
  while (cleanups.length) {
    try {
      cleanups.pop()?.();
    } catch {
      /* ignora erro de limpeza */
    }
  }
});
