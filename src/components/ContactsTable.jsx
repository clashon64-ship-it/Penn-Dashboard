import { useMemo, useState } from 'react'

// Map an outreach status to a badge style. Unknown statuses fall back to neutral.
const STATUS_CLASS = {
  'new client': 'badge-new',
  contacted: 'badge-contacted',
  replied: 'badge-replied',
  booked: 'badge-booked',
  'not interested': 'badge-cold',
  bounced: 'badge-cold',
}

function statusClass(status) {
  return STATUS_CLASS[String(status || '').trim().toLowerCase()] || 'badge-neutral'
}

function scoreClass(score) {
  if (score >= 80) return 'score-high'
  if (score >= 60) return 'score-mid'
  if (score > 0) return 'score-low'
  return 'score-none'
}

export function ContactsTable({ contacts }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter((c) =>
      [c.firstName, c.lastName, c.company, c.location, c.outreachStatus, c.source]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [contacts, query])

  return (
    <div className="card table-card">
      <div className="table-header">
        <h3 className="card-title">Contacts</h3>
        <input
          className="search"
          type="search"
          placeholder="Search name, company, status…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Location</th>
              <th>Source</th>
              <th>Status</th>
              <th className="num">Score</th>
              <th>Date Sent</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.email || `${c.company}-${i}`}>
                <td>{`${c.firstName} ${c.lastName}`.trim() || '—'}</td>
                <td>{c.company || '—'}</td>
                <td className="muted">{c.location || '—'}</td>
                <td className="muted">{c.source || '—'}</td>
                <td>
                  <span className={`badge ${statusClass(c.outreachStatus)}`}>
                    {c.outreachStatus || 'Unknown'}
                  </span>
                </td>
                <td className={`num score ${scoreClass(c.contactScore)}`}>
                  {c.contactScore > 0 ? c.contactScore : '—'}
                </td>
                <td className="muted">{c.dateSent || '—'}</td>
                <td>
                  {String(c.humanReviewNeeded).toLowerCase().startsWith('yes') ? (
                    <span className="badge badge-cold">Yes</span>
                  ) : (
                    <span className="muted">No</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="empty">
                  No contacts match “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
