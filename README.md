# Penn Dashboard

An outreach analytics dashboard for **The Penn Enterprises**, built with
React + Vite. It reads a Google Sheets CRM of cold-outreach prospects (med
spas) and surfaces pipeline status, lead sources, contact scores, and a
searchable contact list.

Expense tracking is stubbed and lights up once an `Expenses` tab is added to
the sheet.

## Architecture

The Google Sheet is **private**. A serverless proxy holds the Google
service-account credentials and reads the sheet server-side, so nothing
sensitive ships to the browser. On Vercel the proxy is co-deployed with the
frontend, so it lives at the same origin under `/api` (no CORS):

```
Private Google Sheet
        │  googleapis service account (read-only)   ← credentials are Vercel env vars
        ▼
/api/dashboard  (Vercel serverless function — api/dashboard.js)
        │  { contacts: [...] }   (same origin)
        ▼
React dashboard  →  src/lib/aggregate.js  →  KPIs, status/source charts, contacts table
```

The frontend only ever fetches a flat `contacts` array; all KPIs and charts are
derived client-side, so the data source stays simple.

> **No Zapier.** The data path is the Google Sheets API accessed directly via
> `googleapis` with a service account — there is no Zapier (or other automation
> middleware) anywhere in the runtime.

## Getting started (local, sample data)

```bash
npm install
npm run dev          # http://localhost:5173
```

With no proxy configured, the dashboard renders built-in **fictional** sample
contacts (a "Sample data" badge shows in the header). No real prospect data
lives in this repo.

## Deploying to Vercel (live data)

The frontend and the `/api` proxy deploy together as one Vercel project.

**1. Create a Google service account** (one-time):

- In the [Google Cloud Console](https://console.cloud.google.com/): create/pick
  a project → enable the **Google Sheets API**.
- _IAM & Admin → Service Accounts_ → create one → **Keys → Add key → JSON** →
  download it.
- Copy the service account's `client_email`, open the Google Sheet → **Share**
  → give that email **Viewer**. The sheet stays private.

**2. Import the repo into Vercel** (one-time):

- [vercel.com](https://vercel.com) → **Add New → Project** → import
  `clashon64-ship-it/Penn-Dashboard`. Vercel auto-detects Vite (see
  `vercel.json`).

**3. Set environment variables** in Vercel → Project → Settings → Environment
Variables:

| Variable                  | Value                                                    |
| ------------------------- | -------------------------------------------------------- |
| `GOOGLE_SHEET_ID`         | the ID from the sheet URL                                |
| `GOOGLE_CREDENTIALS_JSON` | the **entire** service-account JSON, pasted as one value |
| `SHEET_RANGE` (optional)  | defaults to `Sheet1!A:S`                                 |

**4. Deploy.** Vercel builds on import and auto-deploys on every push. The live
app calls `/api/dashboard` and the header badge shows **Live · Proxy**.

`VITE_API_BASE_URL=/api` is baked in via `.env.production`, so no extra frontend
env var is needed on Vercel.

### Local proxy alternative

To test against the real sheet locally without Vercel, run the standalone
Express server in [`server/`](server/README.md), then set
`VITE_API_BASE_URL=http://localhost:8787` in a root `.env`.

## Dashboard sections

- **KPIs** — total contacts, outreach sent, average contact score, needs-review count
- **Outreach Status** — pipeline breakdown (New Client / Contacted / Replied / Booked / …)
- **Leads by Source** — where prospects came from (ICP research, LinkedIn, referral, …)
- **Contacts** — searchable table with status badges, contact score, and review flag
- **Expenses** — placeholder until an `Expenses` tab exists in the sheet

## Sheet mapping

The proxy maps `Sheet1!A:S` to contact fields in column order. The full table is
in [`server/README.md`](server/README.md#sheet-mapping). To adapt to a changed
column layout, edit the `COLUMNS` array and `SHEET_RANGE` in `api/_sheet.js`
(shared by both the serverless function and the standalone server).

## Adding a business section

The dashboard is built as a hub of business "domains" (outreach today; expenses
and others later). Each domain is three small, isolated pieces:

1. **Proxy endpoint** — add `api/<domain>.js`, reusing the service-account auth
   and row-mapping patterns from [`api/_sheet.js`](api/_sheet.js) for the
   relevant sheet range or external API.
2. **Aggregator** — add a `build<Domain>Model(rows)` in
   [`src/lib/aggregate.js`](src/lib/aggregate.js) that turns raw rows into the
   numbers/series that domain needs.
3. **Section + fetcher** — add a `fetch<Domain>()` one-liner in
   [`src/api/client.js`](src/api/client.js) (built on `fetchJson`) and a section
   component, then register it in `App.jsx`. The existing `ExpensesPlaceholder`
   in `src/App.jsx` shows a section awaiting data.

## Project structure

```
api/          Vercel serverless proxy: dashboard.js (handler) + _sheet.js (shared reader)
src/
  api/        client.js (proxy/sample + fetchJson), sampleData.js (fictional fallback)
  lib/        aggregate.js (rows → view model), format.js
  hooks/      useDashboard
  components/ KpiCard, BreakdownChart, ContactsTable
  App.jsx     layout + composition
server/       optional standalone Express proxy (local / non-Vercel), shares api/_sheet.js
vercel.json   Vercel build + SPA-rewrite config
```

## Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start the dev server         |
| `npm run build`   | Production build to `dist/`  |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Run ESLint                   |
