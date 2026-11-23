// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { hostinger } from './integrations/hostinger';

export default defineConfig({
  site: 'https://abrasilbaterias.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Bricolage Grotesque',
      cssVariable: '--font-bricolage',
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      display: 'swap',
      options: {
        variants: [
          { src: ['./src/assets/fonts/bricolage-grotesque-latin-wght-normal.woff2'], weight: '200 800', style: 'normal' },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Inter',
      cssVariable: '--font-inter',
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      display: 'swap',
      options: {
        variants: [{ src: ['./src/assets/fonts/inter-latin-wght-normal.woff2'], weight: '100 900', style: 'normal' }],
      },
    },
  ],
  env: {
    schema: {
      PUBLIC_GA4_ID: envField.string({ context: 'client', access: 'public', optional: true, default: 'G-HRMS08WHM4' }),
      PUBLIC_GADS_ID: envField.string({ context: 'client', access: 'public', optional: true, default: 'AW-815092858' }),
      PUBLIC_GADS_LABEL_WHATSAPP: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
        default: '6iQOCI_B7JUYEPqo1YQD',
      }),
    },
  },
  integrations: [hostinger({ dominio: 'abrasilbaterias.com' })],
  vite: {
    plugins: [tailwindcss()],
  },
});
