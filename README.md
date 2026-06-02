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

By default the dashboard runs against a built-in **sample dataset** so it works
out of the box. To connect a live API, copy `.env.example` to `.env` and set:

```
VITE_API_BASE_URL=https://your-api.example.com
VITE_API_TOKEN=optional-bearer-token
```

The app expects a single endpoint, `GET /dashboard`, returning:

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

`kpi.format` is one of `currency`, `percent`, or `number`. `transaction.status`
is one of `paid`, `pending`, or `failed`.

To change the endpoint shape, edit `src/api/client.js` — the components read the
normalized payload and don't need to change.

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
  api/        API client + sample data (the data contract)
  components/ KPI cards, charts, transactions table
  hooks/      useDashboard data-loading hook
  lib/        formatting helpers
  App.jsx     layout + composition
```
