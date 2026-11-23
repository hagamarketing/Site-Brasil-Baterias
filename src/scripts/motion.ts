/** Preferências de movimento e tipo de dispositivo. */

export const prefersReducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Desktop com mouse de verdade: libera cursor, efeito magnético, tilt 3D e seções fixadas. */
export const isDesktopPointer = (): boolean =>
  window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 64rem)').matches;

export const canAnimate = (): boolean => !prefersReducedMotion();
