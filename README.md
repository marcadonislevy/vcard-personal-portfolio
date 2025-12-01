# Quoralinex People (Folio-lite)

A multi-profile staff directory built on the Folio-lite template. Profiles are rendered from JSON, auto-rotate on the homepage, and support dedicated URLs for every teammate.

## Key features
- JSON-driven profiles with individual URLs (e.g., `/?employee=marclevy` or `/marclevy.html`).
- Auto-rotating sidebar directory with manual selection.
- Dynamic About, Resume, Portfolio, Blog, and Contact sections per staff member.
- Turnstile-protected contact form ready for Cloudflare Workers Email Routing or your preferred webhook.
- Long-cache headers for static assets via `/_headers`.
- Brand-forward Quoralinex theme and refreshed imagery.

## Editing content
1. Update or add teammates in the Quoralinex portal directory UI; the site now fetches `https://portal.quoralinex.com/directory-api/employees` on load.
   - Each entry includes contact info, socials, about copy, services, resume, skills, portfolio, blog posts, and media paths.
2. Add/remove dedicated profile entry pages by copying one of the lightweight `*.html` redirect stubs and updating the slug.
3. Place new brand-approved imagery in `assets/images/` and reference it from the directory data.

## Cloudflare Pages checklist
- **Routing:** The query parameter `?employee=<slug>` resolves profiles; lightweight HTML stubs are provided for direct paths (e.g., `/alicejones.html`). If you prefer extensionless URLs, deploy with the `_redirects` file (e.g., `/alicejones` → `/index.html?employee=alicejones`).
- **Caching:** `_headers` applies `Cache-Control: public, max-age=31536000, immutable` to `/assets/*`.
- **Optimization:** In Pages → Speed → Optimization, enable HTML/CSS/JS minification.
- **Analytics:** Enable Cloudflare Web Analytics in the Pages project for traffic insights.
- **Turnstile:** Replace the placeholder site key in the contact form with your Turnstile site key; validate tokens in a Worker or backend.

## Local preview
Open `index.html` directly in your browser or serve the directory with any static server.

## License
MIT
