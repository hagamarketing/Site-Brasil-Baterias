/** Executa `cb` uma vez quando o elemento chega perto da tela (para carregar JS sob demanda). */
import { onCleanup } from './lifecycle';

export function whenNear(el: Element, cb: () => void, rootMargin = '400px 0px'): void {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        cb();
      }
    },
    { rootMargin },
  );
  io.observe(el);
  onCleanup(() => io.disconnect());
}
