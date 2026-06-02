import { formatValue } from '../lib/format'

export function TransactionsTable({ transactions }) {
  return (
    <div className="card table-card">
      <h3 className="card-title">Recent Transactions</h3>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th className="num">Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="mono">{tx.id}</td>
              <td>{tx.customer}</td>
              <td className="muted">{tx.date}</td>
              <td className="num">{formatValue(tx.amount, 'currency')}</td>
              <td>
                <span className={`badge badge-${tx.status}`}>{tx.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
