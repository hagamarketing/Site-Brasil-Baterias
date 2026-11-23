/**
 * IDs das variáveis de ambiente (padrões em astro.config.ts), validados pelo formato.
 * Valor vazio, "-" ou fora do padrão conta como "não configurado".
 */
import { PUBLIC_GA4_ID, PUBLIC_GADS_ID, PUBLIC_GADS_LABEL_WHATSAPP } from 'astro:env/client';

const valido = (valor: string | undefined, formato: RegExp) => {
  const v = valor?.trim();
  return v && formato.test(v) ? v : undefined;
};

export const GA4_ID = valido(PUBLIC_GA4_ID, /^G-[A-Z0-9]{4,}$/i);
export const GADS_ID = valido(PUBLIC_GADS_ID, /^AW-\d{5,}$/i);
export const GADS_LABEL_WHATSAPP = valido(PUBLIC_GADS_LABEL_WHATSAPP, /^[\w-]{4,}$/);
