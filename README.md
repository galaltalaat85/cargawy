# CarGawy كارجاوي

Arabic-first (RTL) used-car marketplace for Egypt — public website, REST API, and a role-based admin dashboard.

| | |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components, Turbopack), React 19, TypeScript strict |
| UI | Tailwind CSS 4, shadcn/ui-style components on Radix, Lucide icons, Cairo + Inter (self-hosted) |
| Forms | React Hook Form + Zod 4 (same schemas on client and server, Arabic messages) |
| Data | PostgreSQL 16 + Prisma 7 (driver adapter `@prisma/adapter-pg`), migrations + idempotent seed |
| Media | S3-compatible storage (AWS S3, Cloudflare R2, MinIO…) or local disk; `sharp` pipeline → 3 WebP sizes, EXIF stripped |
| Auth | DB-backed sessions (httpOnly cookie, hashed token), bcrypt, RBAC, CSRF origin check, rate limiting, audit log |
| Tests | Vitest (unit + DB integration), Playwright (API security + full acceptance journey) |

## Features

**Public site** — homepage (hero search, popular brands, featured, latest, budget ranges, how it works, testimonials, FAQ), `/used-cars` with 12 combinable server-side filters + sorting + pagination synced to the URL, brand and model hub pages, SEO-friendly car pages `/used-cars/{brand}/{model}/{slug}` (gallery + lightbox, specs, WhatsApp/call, inquiry form, share, favorites, similar cars), multi-step **Sell your car** with photo upload, About / Contact / FAQ / Privacy / Terms, login / register / password reset / email verification, customer account and favorites.

**Admin (`/admin`)** — live dashboard (KPIs + monthly charts), car management (create/edit/duplicate/preview/publish/unpublish/sold/reserved/feature/archive/soft delete/restore/purge, bulk actions, search & filters), drag-and-drop media manager (multi upload, ordering, main image, alt/caption), brands (logo upload, order, enable/disable, safe delete), models (also addable inline from the car form), leads CRM (status pipeline, assignment, notes, manual leads), sell-request inbox (convert to listing), customers, staff & roles, testimonials/FAQ, site settings (contact, social, budget ranges, optional-service toggles), audit log.

**SEO** — per-page metadata, canonical URLs, Open Graph/Twitter cards, XML sitemap (only indexable URLs), robots.txt gated by `ALLOW_INDEXING`, JSON-LD (`AutoDealer`, `WebSite` + SearchAction, `Car`/`Product` + `Offer`, `BreadcrumbList`, `FAQPage`), `noindex,follow` on filter combinations and sold cars, real 404/308 status codes.

**Analytics hooks** — GA4, GTM, Meta Pixel and Search Console via env vars; events for car views, WhatsApp/phone clicks, lead submissions, favorites and searches (no personal data is sent). First-party anonymous view/WhatsApp counters per listing.

> Optional services (inspection, financing, warranty) are **off by default** and hidden everywhere until enabled in *Settings*. The "تم الفحص" badge only shows when inspection is enabled **and** the car is marked as passed.

## Local development

Requirements: Node.js ≥ 20.9 (22 recommended), PostgreSQL 16.

```bash
npm install
```

```bash
cp .env.example .env
```

Create the databases (adjust credentials to match `.env`):

```bash
sudo -u postgres psql -c "CREATE USER cargawy WITH PASSWORD 'cargawy_dev' CREATEDB;" -c "CREATE DATABASE cargawy OWNER cargawy;" -c "CREATE DATABASE cargawy_test OWNER cargawy;"
```

Apply migrations and seed (brands, models, 27 governorates, settings, FAQs; in development also demo staff accounts and 38 demo cars with generated illustrations):

```bash
npx prisma migrate dev
```

```bash
npm run db:seed
```

```bash
npm run dev
```

Open http://localhost:3000 and http://localhost:3000/admin.

### Demo accounts (development only)

All use the password from `SEED_ADMIN_PASSWORD` (default `ChangeMe!2026`). The seed never creates these when `NODE_ENV=production`.

| Email | Role |
|---|---|
| `admin@cargawy.local` (`SEED_ADMIN_EMAIL`) | Super Admin |
| `manager@cargawy.local` | Admin |
| `inventory@cargawy.local` | Inventory Manager |
| `sales@cargawy.local` | Sales Agent |
| `customer@cargawy.local` | Customer |

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / server (the build reads the DB to prerender public pages) |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit` |
| `npm test` | Vitest unit + integration tests (uses `TEST_DATABASE_URL`) |
| `npm run test:e2e` | Playwright: builds and starts the app on port 3100 against `TEST_DATABASE_URL` |
| `npm run db:migrate` / `db:deploy` | Create & apply migration (dev) / apply pending migrations (prod) |
| `npm run db:seed` | Idempotent seed |
| `npm run db:studio` | Prisma Studio |
| `npm run admin:create -- --email … --name …` | Create / reset a Super Admin (safe in production) |

## Roles & permissions

Defined once in `src/lib/auth/permissions.ts` and enforced in every API handler and admin page (UI hiding is cosmetic).

| Role | Can do |
|---|---|
| Super Admin | Everything, including staff accounts and system settings |
| Admin | Listings (incl. delete), brands/models/media, all leads + assignment, sell requests, customers, content, audit log |
| Inventory Manager | Create/edit/publish listings, brands/models, media, sell requests |
| Sales Agent | Read listings; view & update **only leads assigned to them** |
| Customer | Public site, favorites, own account |

## Project structure

```
prisma/              schema.prisma, migrations/, seed.ts, seed-data.ts
src/app/(public)/    public site (home, used-cars/[brand]/[model]/[slug], sell-your-car, …)
src/app/(auth)/      login, register, password reset, email verification
src/app/admin/       admin dashboard
src/app/api/v1/      REST API (public + /admin)
src/components/      ui/, layout/, cars/, filters/, forms/, home/, admin/, dashboard/
src/lib/             auth/, api/, storage/, email/, validation/, seo/, analytics/, env, db, labels, utils
src/server/services/ business logic (cars, media, catalog, leads, sell-requests, users, settings, stats, audit)
src/server/queries/  cached public read models ("use cache" + tags)
tests/               unit/, integration/, e2e/
deploy/, scripts/    Nginx example, backup/restore scripts
docs/                ARCHITECTURE.md, DEPLOYMENT.md, BACKUP.md
```

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — modules, caching strategy, security model, API reference
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — staging & production on a VPS (keeps the existing WordPress site untouched)
- [docs/BACKUP.md](docs/BACKUP.md) — database & media backup and recovery
