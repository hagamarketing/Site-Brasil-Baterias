/**
 * Carregamento sob demanda do GSAP. Nada de GSAP no bundle inicial:
 * cada ilha chama loadGsap() só quando realmente vai animar.
 */
import type { gsap as GsapType } from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';
import { onCleanup } from './lifecycle';

export type Gsap = typeof GsapType;
export type ScrollTriggerStatic = typeof ScrollTriggerType;

let core: Promise<{ gsap: Gsap; ScrollTrigger: ScrollTriggerStatic }> | null = null;

export function loadGsap() {
  core ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([g, st]) => {
    g.gsap.registerPlugin(st.ScrollTrigger);
    st.ScrollTrigger.config({ ignoreMobileResize: true });
    return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger };
  });
  return core;
}

export async function loadSplitText() {
  const [{ gsap }, { SplitText }] = await Promise.all([loadGsap(), import('gsap/SplitText')]);
  gsap.registerPlugin(SplitText);
  return SplitText;
}

export async function loadDrawSVG() {
  const [{ gsap }, { DrawSVGPlugin }] = await Promise.all([loadGsap(), import('gsap/DrawSVGPlugin')]);
  gsap.registerPlugin(DrawSVGPlugin);
  return DrawSVGPlugin;
}

export async function loadFlip() {
  const [{ gsap }, { Flip }] = await Promise.all([loadGsap(), import('gsap/Flip')]);
  gsap.registerPlugin(Flip);
  return Flip;
}

/** Cria um gsap.context que é revertido automaticamente na troca de página. */
export async function scopedContext(scope: Element, fn: (gsap: Gsap, ST: ScrollTriggerStatic) => void) {
  const { gsap, ScrollTrigger } = await loadGsap();
  const ctx = gsap.context(() => fn(gsap, ScrollTrigger), scope);
  onCleanup(() => ctx.revert());
  return ctx;
}
