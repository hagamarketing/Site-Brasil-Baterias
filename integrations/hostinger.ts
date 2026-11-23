/**
 * Integração para hospedagem na Hostinger (Apache/LiteSpeed).
 *
 * No fim do build grava:
 *  - dist/.htaccess: força HTTPS, www → sem www, páginas sem ".html", página 404,
 *    cabeçalhos de segurança, compressão e cache do HTML sempre revalidado;
 *  - dist/_astro/.htaccess: cache de 1 ano para os arquivos com hash no nome.
 */
import type { AstroIntegration } from 'astro';
import { writeFile } from 'node:fs/promises';

function htaccess(dominio: string): string {
  const host = dominio.replace(/\./g, '\\.');
  return `# Gerado automaticamente no build (integrations/hostinger.ts). Não edite no servidor.
Options -MultiViews -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html

AddType image/avif .avif
AddType application/manifest+json .webmanifest

<IfModule mod_rewrite.c>
RewriteEngine On

# Forçar HTTPS (ative o SSL no hPanel antes)
RewriteCond %{HTTPS} off
RewriteCond %{HTTP:X-Forwarded-Proto} !https [NC]
RewriteRule ^ https://${dominio}%{REQUEST_URI} [R=301,L]

# www.${dominio} → ${dominio}
RewriteCond %{HTTP_HOST} ^www\\.${host}$ [NC]
RewriteRule ^ https://${dominio}%{REQUEST_URI} [R=301,L]

# Páginas sem ".html": /privacidade → privacidade.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{DOCUMENT_ROOT}/$1.html -f
RewriteRule ^(.+?)/?$ $1.html [L]
</IfModule>

<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css application/javascript text/javascript application/json image/svg+xml
</IfModule>

<IfModule mod_expires.c>
ExpiresActive On
ExpiresByType image/png "access plus 30 days"
ExpiresByType image/webp "access plus 30 days"
ExpiresByType image/avif "access plus 30 days"
</IfModule>

<IfModule mod_headers.c>
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
<FilesMatch "\\.html$">
Header set Cache-Control "public, max-age=0, must-revalidate"
</FilesMatch>
</IfModule>
`;
}

const CACHE_ASSETS = `# Arquivos com hash no nome: podem ficar em cache por 1 ano
<IfModule mod_headers.c>
Header set Cache-Control "public, max-age=31536000, immutable"
</IfModule>
`;

export function hostinger(opts: { dominio: string }): AstroIntegration {
  return {
    name: 'brasil-baterias:hostinger',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        await writeFile(new URL('.htaccess', dir), htaccess(opts.dominio));
        await writeFile(new URL('_astro/.htaccess', dir), CACHE_ASSETS);
        logger.info('.htaccess gerado');
      },
    },
  };
}
