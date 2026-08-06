# Physical Activity Research Center

This repository holds the **static** Physical Activity Research Center website, built for **GitHub Pages** from the `docs/` folder on `main`.

This project prepares the public site content on GitHub Pages ahead of a planned move from the current hosted environment. The **paresearchcenter.org** domain is intended to use this deployment when that transition happens—this repo is the basis for that site, not a separate mirror of it.

**Prepared:** August 2026

- **Development / build pipeline:** branch `refactor/cleaningup-code`

## Static site notice

This deployment is **read-only HTML**, not WordPress. Pages, images, and downloads from the export are kept so visitors can still browse the site after migration. Features that depended on WordPress or the old host **are not available**:

- **News and blog updates** — no new posts after export; existing articles remain as published.
- **User registration and login** — accounts, admin login, and the dashboard are removed.
- **Content management** — no admin interface to create or edit pages, posts, or media.
- **RSS and comment feeds** — feed endpoints from the WordPress era are not maintained.
- **Interactive / server-side features** — forms, plugins, and backend services that required WordPress or hosting infrastructure no longer run.

Layout and links are preserved where possible so the site stays usable as the public face of PARC on GitHub Pages.

## Search

Search uses a **client-side index** built from the static HTML pages. It replaces WordPress search in a simplified form and **results may differ** from what the WordPress site showed in ranking, wording, and which pages appear. Results are shown in a blog-style layout on the `/search/` page.

## Repository layout

| Branch | Purpose |
|--------|---------|
| **`main`** | GitHub Pages deploy — `docs/` only |
| **`refactor/cleaningup-code`** | Source export, build scripts, and maintenance tools |

To update the published site, work on the development branch and publish:

```powershell
git checkout refactor/cleaningup-code
python scripts/publish_to_main.py --push
```

See `MAINTENANCE.md` and `REFACTOR.md` on the development branch for build and maintenance details.
