# Penn Dashboard

An outreach analytics dashboard for **The Penn Enterprises**, built with
React + Vite. It reads a Google Sheets CRM of cold-outreach prospects (med
spas) and surfaces pipeline status, lead sources, contact scores, and a
searchable contact list.

Expense tracking is stubbed and lights up once an `Expenses` tab is added to
the sheet.

## Architecture

The Google Sheet is **private**. A small backend proxy holds the Google
service-account credentials and reads the sheet server-side, so nothing
sensitive ships to the browser:

```
Private Google Sheet
        │  (service account, read-only)
        ▼
Backend proxy (server/)  ──►  GET /dashboard  →  { contacts: [...] }
        │
        ▼
React dashboard (VITE_API_BASE_URL → proxy)
        │
        ▼
Aggregation (src/lib/aggregate.js) → KPIs, status/source breakdowns, table
```

The frontend only ever fetches a flat `contacts` array; all KPIs and charts are
derived client-side, so the data source stays simple.

## Getting started

### 1. Frontend (works immediately on sample data)

```bash
npm install
npm run dev          # http://localhost:5173
```

With no proxy configured, the dashboard renders built-in **fictional** sample
contacts (a "Sample data" badge shows in the header). No real prospect data
lives in this repo.

### 2. Backend proxy (to use the real sheet)

See [`server/README.md`](server/README.md) for the full setup: create a Google
service account, share the sheet with its email (Viewer), and run:

```bash
cd server
npm install
cp .env.example .env   # set GOOGLE_SHEET_ID + service-account.json
npm run dev            # http://localhost:8787
```

Then, in the project root, copy `.env.example` to `.env` and set:

```
VITE_API_BASE_URL=http://localhost:8787
```

Restart `npm run dev` and the header badge flips to "Live · Proxy".

## Dashboard sections

- **KPIs** — total contacts, outreach sent, average contact score, needs-review count
- **Outreach Status** — pipeline breakdown (New Client / Contacted / Replied / Booked / …)
- **Leads by Source** — where prospects came from (ICP research, LinkedIn, referral, …)
- **Contacts** — searchable table with status badges, contact score, and review flag
- **Expenses** — placeholder until an `Expenses` tab exists in the sheet

## Sheet mapping

The proxy maps `Sheet1!A:S` to contact fields in column order. The full table is
in [`server/README.md`](server/README.md#sheet-mapping). To adapt to a changed
column layout, edit the `COLUMNS` array and `SHEET_RANGE` in `server/index.js`.

## Project structure

```
src/
  api/        client.js (proxy/sample), sampleData.js (fictional fallback)
  lib/        aggregate.js (contacts → view model), format.js
  hooks/      useDashboard
  components/ KpiCard, BreakdownChart, ContactsTable
  App.jsx     layout + composition
server/       Express proxy that reads the private sheet
```

## Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start the dev server         |
| `npm run build`   | Production build to `dist/`  |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Run ESLint                   |
