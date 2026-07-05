import { useMemo, useState } from 'react'
import { formatValue } from '../lib/format'

/**
 * Searchable expense transaction list (newest first — buildExpensesModel
 * pre-sorts by date descending).
 */
export function ExpensesTable({ expenses }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return expenses
    return expenses.filter((e) =>
      [e.vendor, e.category, e.description, e.date].join(' ').toLowerCase().includes(q),
    )
  }, [expenses, query])

  return (
    <div className="card table-card">
      <div className="table-header">
        <h3 className="card-title">Transactions</h3>
        <input
          className="search"
          type="search"
          placeholder="Search vendor, category…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Vendor</th>
              <th>Category</th>
              <th>Description</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={`${e.date}-${e.vendor}-${i}`}>
                <td className="muted">{e.date || '—'}</td>
                <td>{e.vendor || '—'}</td>
                <td>
                  <span className="badge badge-neutral">{e.category || 'Uncategorized'}</span>
                </td>
                <td className="muted">{e.description || '—'}</td>
                <td className="num">{formatValue(Math.round(e.amount), 'currency')}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  No expenses match “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
