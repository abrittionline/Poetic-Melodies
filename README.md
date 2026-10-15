# Poetic Melodies — কবিতার গান · 1.0

It's Poetry in Song. **A Creation by Sohel Azad.**

A functioning Bengali-first editorial poetry website and installable PWA built with Next.js App Router, TypeScript, React and Tailwind CSS. No API keys, paid accounts, database or remote fonts are required.

## Run locally

Use Node.js 22 or newer (tested with Node 24) and npm.

```sh
npm ci --cache /tmp/poetic-npm
npm run dev
```

Open the local server printed by Next.js. For a production build:

```sh
npm run build
npm start
```

## Explore

- `/`: featured poem, latest productions and curated series.
- `/poetry`: bilingual text search, category and media filters.
- `/audio`, `/video`: listening and viewing libraries.
- `/poem/window`: poem text, native accessible audio controls and sharing.
- `/series`, `/albums`, `/poets`: collections and individual profiles.
- `/admin`: local editor; demo password **`poetry-demo`**.
- `/about`: brand story and demonstration media disclosure.

The language button persists your interface preference. Original Bengali verse remains Bengali in English mode. All seed poems are original illustrative content, not attributed historical poems. The generated 12-second WAV is an original instrumental playback demo, not an actual recitation. The 10-second ambient video is an original locally generated river landscape with instrumental audio, not a spoken recording. Replace these samples with media you have permission to publish.

## Editing and publication

The demo login is a **client-side session gate, not a security boundary**. Never use it to protect sensitive data. No production authentication is claimed.

Create, edit, delete, publish and unpublish poems, categories, subcategories, series, albums, poets and media. Titles in both languages are required. Relations are selected from existing items. Referenced records cannot be deleted until their references are removed. Unpublishing a related collection/category/profile also hides its associated poems from public views. Media entries are templates: selecting one copies its URL and format into a poem, so changing/deleting a media record does not modify existing poems.

Edits persist in `localStorage` under `poetic-melodies-v1`; login persists for the tab in `sessionStorage`. Publishing affects only this browser and origin. It is not a deployment and does not sync to other visitors or devices. Storage is finite and browser clearing erases edits. Export JSON regularly; import replaces all local content after confirmation. A fresh browser uses the seed library. To reset, export first, then remove the `poetic-melodies-v1` localStorage key in browser developer tools and reload.

Audio/video uploads are stored as data URLs (2 MB per file, limited by the browser's total quota). Larger files should use a reachable HTTPS URL. Quota errors leave the in-memory library unchanged. There is no server upload endpoint. Use the Media Library to add URLs or upload files, preview them, then attach them to poems. Publication controls are available on every entity tab.

## PWA and offline behavior

`public/manifest.webmanifest` includes 192/512 PNG icons and a maskable icon. `public/sw.js` precaches the public shell and local audio/video, caches visited same-origin GET requests, and supports audio byte ranges offline. Admin pages, Next.js RSC requests and external media are not cached. A first online production visit is needed; allow the worker to activate and reload once. Visited public routes and the home fallback can then load offline. An uncached route can render the app shell and resolve its content client-side. Draft edits remain in browser storage. The included local video also works offline; any external media you add requires connectivity.

Use HTTPS in deployment (localhost is allowed for development). Chromium exposes “Install app” in the footer when an install prompt is available; otherwise use the browser menu. On iOS use Share → Add to Home Screen. Live Next development updates and service-worker caches can conflict; verify PWA behavior with the production server. Clear site data/unregister the worker when investigating stale development assets. Increment the cache version when changing the offline shell.

## Validate

```sh
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

The Playwright suite starts a production server on port 3100. Build first. It checks search/filter and empty states, language switching, audio, admin login, draft/publication persistence, backup download, collections, phone overflow and offline PWA reload. This cloud machine has Chromium at `/usr/bin/chromium`: run `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` to use it without a browser download.

Browser system dependencies may require `npx playwright install-deps chromium` on a minimal Linux machine.

Manual checks: play/pause/seek audio; play the local ambient video; create a media upload under 2 MB; edit a poem and attach it; publish/unpublish and inspect the public library; export, change content, then import; install on a supported browser and reload offline after first online visit. Keyboard focus, native media controls, semantic landmarks, labels, a skip link and reduced-motion support are included.

## Architecture and future backend

- `lib/content.ts`: typed entities, relationships and seed content.
- `lib/repository.ts`: validation and local persistence adapter; replace with an asynchronous Supabase repository rather than coupling UI to SQL.
- `components/Experience.tsx`: bilingual public views and local editor.
- `app/[[...slug]]/page.tsx`: prototype route entry point.
- `public/`: generated original sample audio/video, app icons, manifest and service worker.

For production, split the route entry into server-rendered resource pages and implement real server authorization, Supabase Auth, row-level security, relational foreign keys, schema migrations and object storage. Replace the demo session gate, enforce permissions on every write and migrate browser JSON through a validated import. Add comments and member accounts with ownership/moderation tables and authenticated policies; none are simulated as working features here. Add translated descriptions/verse, media rights metadata, per-resource SEO and real 404 status handling as part of that server transition. Do not put service role keys in client code. There is intentionally no Supabase dependency or credential requirement in v1.
