# Penn Dashboard

An outreach + finance analytics dashboard for **The Penn Enterprises**, built
with React + Vite. It reads a Google Sheets CRM of cold-outreach prospects
(med spas) and surfaces pipeline status, lead sources, contact scores, and a
searchable contact list — plus a **Finance** section (spend KPIs, monthly
trend, category breakdown, transactions) fed by an `Expenses` tab in the same
sheet. Until that tab exists, the Finance section shows setup instructions
instead of erroring.

## Website video updates

Use [`docs/website-video-update-playbook.md`](docs/website-video-update-playbook.md)
as the starter guide for adding videos of current Penn Enterprises work,
automations, dashboards, and shipped systems to the public website.

The guide explains the GitHub workflow, where videos should live, the portfolio
metadata shape, and what receipts are required before calling a website update
complete.

## Architecture

The Google Sheet is **private**. A serverless proxy holds the Google
service-account credentials and reads the sheet server-side, so nothing
sensitive ships to the browser. On Vercel the proxy is co-deployed with the
frontend, so it lives at the same origin under `/api` (no CORS):

```
Private Google Sheet (Sheet1 = CRM, Expenses = spend)
        │  googleapis service account (read-only)   ← credentials are Vercel env vars
        ▼
/api/dashboard + /api/expenses  (Vercel serverless functions)
        │  { contacts: [...] } / { available, expenses: [...] }   (same origin)
        ▼
React dashboard  →  src/lib/aggregate.js  →  KPIs, charts, tables (outreach + finance)
```

The frontend only ever fetches flat row arrays; all KPIs and charts are
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

| Variable                    | Value                                                    |
| --------------------------- | -------------------------------------------------------- |
| `GOOGLE_SHEET_ID`           | the ID from the sheet URL                                |
| `GOOGLE_CREDENTIALS_JSON`   | the **entire** service-account JSON, pasted as one value |
| `SHEET_RANGE` (optional)    | defaults to `Sheet1!A:S`                                 |
| `EXPENSES_RANGE` (optional) | defaults to `Expenses!A:E`                               |

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
- **Finance** — total / latest-month / average-monthly spend and top category,
  monthly spend trend, spend-by-category donut, and a searchable transaction
  list. Reads the `Expenses` tab (`date`, `category`, `vendor`, `description`,
  `amount` in columns A–E, header row first); shows setup instructions until
  that tab exists.

## Sheet mapping

The proxy maps `Sheet1!A:S` to contact fields and `Expenses!A:E` to expense
fields, both in column order. The full tables are in
[`server/README.md`](server/README.md#sheet-mapping). To adapt to a changed
column layout, edit the `COLUMNS` array and `SHEET_RANGE` in `api/_sheet.js`,
or `EXPENSE_COLUMNS` and `EXPENSES_RANGE` in `api/_expenses.js` (both shared
by the serverless functions and the standalone server).

## Adding a business section

The dashboard is built as a hub of business "domains" (outreach and finance
today; others later). Each domain is three small, isolated pieces:

1. **Proxy endpoint** — add `api/<domain>.js`, reusing the service-account auth
   and row-mapping patterns from [`api/_sheet.js`](api/_sheet.js) for the
   relevant sheet range or external API.
2. **Aggregator** — add a `build<Domain>Model(rows)` in
   [`src/lib/aggregate.js`](src/lib/aggregate.js) that turns raw rows into the
   numbers/series that domain needs.
3. **Section + fetcher** — add a `fetch<Domain>()` one-liner in
   [`src/api/client.js`](src/api/client.js) (built on `fetchJson`) and a section
   component, then register it in `App.jsx`. The finance domain
   (`api/expenses.js` → `buildExpensesModel` → `FinanceSection`) is a complete
   worked example, including graceful "data source not set up yet" handling.

## Project structure

```
api/          Vercel serverless proxy: dashboard.js + expenses.js (handlers),
              _sheet.js + _expenses.js (shared readers)
src/
  api/        client.js (proxy/sample + fetchJson), sampleData.js (fictional fallback)
  lib/        aggregate.js (rows → view models: outreach + finance), format.js
  hooks/      useDashboard, useExpenses
  components/ KpiCard, BreakdownChart, ContactsTable,
              FinanceSection, SpendTrendChart, ExpensesTable
  App.jsx     layout + composition
server/       optional standalone Express proxy (local / non-Vercel), shares api/ readers
vercel.json   Vercel build + SPA-rewrite config
```

## Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start the dev server         |
| `npm run build`   | Production build to `dist/`  |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Run ESLint                   |
