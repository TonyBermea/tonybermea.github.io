# Tony Bermea portfolio

A static-first portfolio built with Astro, MDX content collections, vanilla CSS, and focused Preact islands. The site combines a restrained editorial homepage with reusable project case studies.

## Local commands

```sh
npm install
npm run dev
npm run test:all
```

The main routes are `/`, `/work/field-index/`, `/work/coffee-cupping/`, `/work/lineage/`, `/work/npkn-studio/`, `/work/gumo-supplies/`, and `/work/mchns/`. Unknown work slugs return the custom 404 page.

## Content and structure

- `src/pages/index.astro` — static homepage with no client JavaScript
- `src/data/site.ts` — typed identity, biography, contact, and social links
- `src/data/work/` — six schema-validated MDX case studies
- `src/content.config.ts` — work collection schema
- `src/components/mdx/` — constrained case-study blocks
- `src/components/islands/` — lazily hydrated Preact demonstrations
- `src/data/selected-work.ts` — stable homepage ordering plus the Soul Mag and Pixel Vault snapshots
- `src/assets/` — original portfolio and case-study media

To add a case study, create an MDX entry in `src/data/work/` with complete frontmatter, then add a `case-study` record with the matching slug in `src/data/selected-work.ts`. The build validates missing slugs, duplicate identifiers, accents, and required metadata.

## Asset provenance

All production media is stored locally; nothing is hotlinked at runtime. Gumo Supplies uses original, logo-free stationery photography and reconstructed storefront views with representative catalogue data. Field Index uses sample records and prototype imagery disclosed in the case study. Interactive modules include local static fallbacks. JetBrains Mono WOFF2 files and `OFL-JetBrainsMono.txt` are self-hosted under the SIL Open Font License.

Selected work contains six internal studies and two external projects. Pixel Vault is visibly labeled decommissioned while retaining its preserved snapshot link. Field Index discloses that its preview records are sample data, and Lineage uses entirely synthetic clinical content and is not medical software.

## Quality checks

`npm run test:all` runs model/content tests, Astro schema and type checks, the production build, and Playwright coverage. The browser suite checks all six internal routes, route-specific Preact interactions, reduced motion, no-JavaScript fallbacks, accessibility, and overflow at 1280px, 864px, 390px, and 320px.

## GitHub Pages

The repository includes `.github/workflows/deploy.yml`. A push to `main` builds and publishes the portfolio with GitHub's Pages deployment flow.

The Astro configuration detects the GitHub repository automatically:

- A repository named `<username>.github.io` is served from `/`.
- Any other repository is served from `/<repository-name>/`.

After creating the repository, choose **Settings → Pages → Source → GitHub Actions** once. Every later push to `main` deploys automatically. Keep `package-lock.json` committed so the build uses the tested dependency versions.

For a custom domain, add `public/CNAME` and create a repository Actions variable named `SITE_URL` containing the complete HTTPS origin, such as `https://portfolio.example.com`.
