import { useExpenses } from '../hooks/useExpenses'
import { formatValue } from '../lib/format'
import { KpiCard } from './KpiCard'
import { BreakdownChart } from './BreakdownChart'
import { SpendTrendChart } from './SpendTrendChart'
import { ExpensesTable } from './ExpensesTable'

/**
 * Finance domain section: spend KPIs, monthly trend, category breakdown, and
 * the transaction list. Owns its own data fetch (useExpenses), so it loads
 * and fails independently of the outreach dashboard above it.
 */
export function FinanceSection() {
  const { model, available, loading, error, refetch } = useExpenses()

  return (
    <section className="finance-section">
      <div className="section-header">
        <h2 className="section-title">Finance</h2>
        <span className="section-subtitle">Business spend overview</span>
      </div>

      {error && (
        <div className="banner banner-error">
          Failed to load expenses: {error.message}
          <button className="btn btn-sm" onClick={refetch}>
            Retry
          </button>
        </div>
      )}

      {loading && !model && !error && (
        <div className="card placeholder-card">
          <p className="placeholder-text">Loading expenses…</p>
        </div>
      )}

      {!loading && !error && !available && <ExpensesSetupCard />}

      {model && (
        <>
          <div className="kpi-grid">
            {model.kpis.map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))}
          </div>

          <div className="charts-grid">
            <SpendTrendChart data={model.monthlySeries} />
            <BreakdownChart
              title="Spend by Category"
              data={model.categoryBreakdown}
              valueFormatter={(v) => formatValue(v, 'currency')}
            />
          </div>

          <ExpensesTable expenses={model.expenses} />
        </>
      )}
    </section>
  )
}

// Shown until the sheet has an Expenses tab with data.
function ExpensesSetupCard() {
  return (
    <div className="card placeholder-card">
      <p className="placeholder-text">
        No expense data found in the connected sheet yet. To light this section
        up, add an <code>Expenses</code> tab with the columns <code>date</code>,{' '}
        <code>category</code>, <code>vendor</code>, <code>description</code>,{' '}
        and <code>amount</code> (in that order, header row first) — spend KPIs,
        a monthly trend, and a category breakdown will appear here
        automatically.
      </p>
    </div>
  )
}
