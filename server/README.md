# Penn Dashboard — Backend Proxy

A small Express server that reads the private Google Sheet using a **Google
service account** and serves normalized contacts to the dashboard. The sheet
stays private — the credentials live here, server-side, and never reach the
browser.

```
Private Google Sheet  ──(service account, read-only)──►  this proxy  ──►  GET /dashboard  ──►  React app
```

## One-time setup

1. **Create a service account** in the
   [Google Cloud Console](https://console.cloud.google.com/):
   - Create (or pick) a project → **Enable the Google Sheets API**.
   - _IAM & Admin → Service Accounts → Create service account._
   - Create a **JSON key** for it and download the file. Save it here as
     `server/service-account.json` (this file is gitignored — never commit it).

2. **Share the sheet with the service account.** Open the JSON key, copy the
   `client_email` (looks like `name@project.iam.gserviceaccount.com`), then in
   Google Sheets click **Share** and give that email **Viewer** access. The
   sheet does **not** need to be public.

3. **Configure env:**
   ```bash
   cp .env.example .env
   # set GOOGLE_SHEET_ID, and GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
   ```

## Run

```bash
npm install
npm run dev      # or: npm start
```

- `GET /dashboard` → `{ contacts: [...], count, fetchedAt }`
- `GET /health`    → `{ ok: true }`

Then point the frontend at it by setting `VITE_API_BASE_URL=http://localhost:8787`
in the project root `.env`.

## Sheet mapping

Columns `A:S` of `Sheet1` map to the contact fields in order (see the `COLUMNS`
array in `index.js`):

| Col | Field            | Col | Field             |
| --- | ---------------- | --- | ----------------- |
| A   | firstName        | K   | outreachStatus    |
| B   | lastName         | L   | dateSent          |
| C   | email            | M   | emailSubject      |
| D   | company          | N   | notes             |
| E   | title            | O   | emailBody         |
| F   | industry         | P   | phone             |
| G   | employeeCount\*  | Q   | emailConfidence   |
| H   | location         | R   | contactScore\*    |
| I   | linkedinUrl      | S   | humanReviewNeeded |
| J   | source           |     |                   |

\* parsed as numbers. If your column order changes, update `COLUMNS` and
`SHEET_RANGE`.

## Deploying

Any Node host works (Railway, Render, Fly, a small VM). Set the same env vars
there, and provide the service-account JSON (most hosts let you store it as a
secret file or as a `GOOGLE_APPLICATION_CREDENTIALS` JSON string — adjust the
auth in `index.js` if you pass the JSON inline rather than as a file path).
Set `ALLOWED_ORIGIN` to your deployed frontend's URL.
