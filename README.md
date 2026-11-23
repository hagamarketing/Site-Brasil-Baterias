# Brasil Baterias — site

Site da **A Brasil Baterias** (Marília-SP) — https://abrasilbaterias.com

Mesma base dos sites da Haga Marketing e do Daruma: **Astro 7** (estático) + **Tailwind CSS v4** + **GSAP** (ScrollTrigger, SplitText) + **Lenis** (rolagem suave no desktop) + TypeScript.

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # confere os tipos e gera a pasta dist/
npm run preview  # abre o dist/ para conferir
```

Node 22.23+ (o `.nvmrc` indica o 24).

## Onde mexer

| O quê | Arquivo |
| --- | --- |
| Telefone, WhatsApp, e-mail, endereço, horários | `src/data/site.ts` |
| **Preços** das baterias e cards das mais vendidas | `src/data/baterias.ts` |
| Textos (sobre nós, benefícios, passos, dúvidas) | `src/data/conteudo.ts` |
| Catálogo de veículos × baterias (902 veículos) | `src/data/veiculos.json` |
| Assistente de pedido (4 passos, CEP, WhatsApp) | `src/scripts/pedido.ts` |
| Cores e efeitos | `src/styles/global.css`, `src/styles/pedido.css` |
| Fotos | `public/imagens/` |
| IDs do Google (GA4, Ads) | `astro.config.ts` (ou variáveis `PUBLIC_*`, veja `.env.example`) |

## Publicar na Hostinger

**Opção A — automática pelo GitHub (recomendada):** no hPanel, *Sites → Adicionar site → Aplicação Node.js / importar do GitHub*, escolha este repositório, framework **Astro**, comando de build `npm run build`, pasta de saída `dist`, Node 24. A cada mesclagem na `main` o site é republicado.

**Opção B — manual:** rode `npm run build` e envie **todo o conteúdo** da pasta `dist/` (incluindo o arquivo oculto `.htaccess`) para `public_html`.

O build gera o `.htaccess` (HTTPS, www → sem www, 404, cabeçalhos de segurança e cache) em `integrations/hostinger.ts`.

## Rastreamento

GA4 e Google Ads são carregados depois que a página abre. Todo link `wa.me` registra o evento `whatsapp_click` e a conversão do Google Ads (`src/scripts/analytics.ts`).
