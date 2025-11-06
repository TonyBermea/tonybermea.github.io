# Repository Guidelines

## Project Structure & Module Organization
- This repo stores the static export of tonybermea.dev.
- `index.html` is the landing page; keep semantics accessible.
- `_next/static/` holds hashed CSS/JS; replace via upstream exports, never hand edit.
- `images/` keeps optimized assets; maintain descriptive kebab-case names.
- `404.html`, `CNAME`, and `LICENSE` rarely change; ensure domain and legal details stay aligned.

## Build, Test, and Development Commands
- Serve locally with `python3 -m http.server 3000`, then visit `http://localhost:3000`.
- Rebuild from the upstream Next.js project (`npm run build && npm run export`) and copy the fresh `out/` files here when hashes change.
- Check formatting with `npx prettier@latest --check "**/*.html"` before committing manual edits.

## Coding Style & Naming Conventions
- Use two-space indent in manually edited HTML.
- Group Tailwind-style utility classes by layout, typography, and state to keep markup scannable.
- Name new assets in lowercase kebab-case and reference them with relative paths.
- Treat `_next/static` bundles as read-only artifacts.

## Testing Guidelines
- Test mobile (≤425px) and desktop (≥1280px) breakpoints for every change.
- Review the accessibility tree in devtools to confirm headings, aria labels, and focus order.
- Optionally run `npx lighthouse http://localhost:3000 --view` to watch key scores.

## Commit & Pull Request Guidelines
- Follow the short imperative commit style seen in history (`Fix landscape view`).
- Group related markup and asset updates and call out visual impact in the commit body when needed.
- Pull requests should state motivation, list manual checks, attach before/after screenshots, link tracking issues, and share a live preview if available.

## Asset & Security Notes
- Compress new media ≤1MB and prefer modern formats before adding.
- Ensure external links inside the markup stay on HTTPS endpoints.
- Keep secrets and env values out of the repo; manage them in the upstream pipeline.
