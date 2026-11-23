/**
 * Tags de marketing: GA4 e Google Ads (conversão do botão de WhatsApp).
 * Carregadas depois que a página termina de abrir, para não pesar no carregamento.
 */
import { GA4_ID, GADS_ID, GADS_LABEL_WHATSAPP } from './env';

type Fn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: Fn;
  }
}

let loaded = false;

export function loadTags(): void {
  if (loaded) return;
  loaded = true;
  const gtagId = GA4_ID || GADS_ID;
  if (!gtagId) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag exige o objeto `arguments`, não um array
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  if (GA4_ID) window.gtag('config', GA4_ID);
  if (GADS_ID) window.gtag('config', GADS_ID);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`;
  document.head.append(s);
}

/** Clique em qualquer link do WhatsApp: evento no GA4 e conversão do Google Ads. */
export function trackWhatsApp(origem: string): void {
  window.gtag?.('event', 'whatsapp_click', { origem });
  if (GADS_ID && GADS_LABEL_WHATSAPP) {
    window.gtag?.('event', 'conversion', { send_to: `${GADS_ID}/${GADS_LABEL_WHATSAPP}` });
  }
}
