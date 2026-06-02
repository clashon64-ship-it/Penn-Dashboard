# Penn Dashboard

A business analytics dashboard built with React + Vite. Displays KPIs, a
revenue/expense time series, segment breakdown, and recent transactions.

## Getting started

```bash
npm install
npm run dev
```

The app runs at http://localhost:5173.

## Data

The dashboard chooses a data source automatically, in this order:

1. **Google Sheets** — if `VITE_GOOGLE_SHEET_ID` + `VITE_GOOGLE_API_KEY` are set
2. **REST API** — if `VITE_API_BASE_URL` is set (expects `GET /dashboard`)
3. **Sample data** — built-in fallback, used when nothing is configured

A badge in the header shows which source is active. Copy `.env.example` to
`.env` to configure one.

### Google Sheets (primary)

1. **Create the spreadsheet** with four tabs (worksheets). The **first row of
   each tab is a header row**; remaining rows are records:

   | Tab            | Columns                                   |
   | -------------- | ----------------------------------------- |
   | `KPIs`         | `id`, `label`, `value`, `format`, `change`|
   | `Timeseries`   | `month`, `revenue`, `expenses`, `profit`  |
   | `Categories`   | `name`, `value`                           |
   | `Transactions` | `id`, `customer`, `amount`, `status`, `date` |

   `format` is one of `currency` / `percent` / `number`. `status` is one of
   `paid` / `pending` / `failed`. The `profit` column is optional — it's
   derived from `revenue - expenses` when omitted. Numeric cells may contain
   `$`, `,`, or `%` (e.g. `$1,240,000`, `12.5%`); they're parsed automatically.

2. **Share the sheet**: _Share → General access → Anyone with the link →
   Viewer_.

3. **Create an API key**: in the [Google Cloud Console](https://console.cloud.google.com/),
   enable the **Google Sheets API**, then create an API key
   (_APIs & Services → Credentials_). For production, restrict the key to your
   site's domain and to the Sheets API only.

4. **Configure `.env`**:

   ```
   VITE_GOOGLE_SHEET_ID=<id from the sheet URL .../spreadsheets/d/<ID>/edit>
   VITE_GOOGLE_API_KEY=<your key>
   ```

   Tab names can be overridden with `VITE_SHEET_TAB_*` (see `.env.example`).

> **Note:** the API key ships in the client bundle, so only ever use it with a
> sheet you're comfortable exposing read-only, and restrict the key by domain.
> For sensitive data, proxy through the REST API option below instead.

### REST API (alternative)

Set `VITE_API_BASE_URL` (and optionally `VITE_API_TOKEN`). The app expects a
single endpoint, `GET /dashboard`, returning the normalized payload:

```json
{
  "kpis": [
    { "id": "revenue", "label": "Total Revenue", "value": 1234567,
      "format": "currency", "change": 5.2 }
  ],
  "timeseries": [
    { "month": "Jan", "revenue": 420000, "expenses": 310000, "profit": 110000 }
  ],
  "categories": [
    { "name": "Enterprise", "value": 1240000 }
  ],
  "transactions": [
    { "id": "TX-10428", "customer": "Northwind Capital", "amount": 84200,
      "status": "paid", "date": "2026-05-28" }
  ]
}
```

All three sources resolve to this same shape, so the components never need to
know where the data came from. To adapt the mapping, edit `src/api/googleSheets.js`
or `src/api/client.js`.

## Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start the dev server         |
| `npm run build`   | Production build to `dist/`  |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Run ESLint                   |

## Project structure

```
src/
  api/        Data sources: googleSheets.js, client.js, sampleData.js
  components/ KPI cards, charts, transactions table
  hooks/      useDashboard data-loading hook
  lib/        formatting helpers
  App.jsx     layout + composition
```
