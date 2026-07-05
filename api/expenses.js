// Vercel serverless function: GET /api/expenses
//
// Finance domain endpoint. Reads the private Google Sheet's Expenses tab
// server-side (via api/_expenses.js, service-account auth) and returns
// normalized expense rows. Same origin as the frontend, so no CORS handling
// is required.

import { loadExpenses } from './_expenses.js'

export default async function handler(_req, res) {
  try {
    const { available, expenses } = await loadExpenses()
    res.status(200).json({
      available,
      expenses,
      count: expenses.length,
      fetchedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Failed to read the Expenses tab:', err.message)
    res.status(502).json({
      error: 'Failed to read the Expenses tab',
      detail: err.message,
    })
  }
}
