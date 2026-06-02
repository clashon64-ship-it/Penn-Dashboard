import { useDashboard } from './hooks/useDashboard'
import { dataSource } from './api/client'
import { KpiCard } from './components/KpiCard'
import { RevenueChart } from './components/RevenueChart'
import { CategoryChart } from './components/CategoryChart'
import { TransactionsTable } from './components/TransactionsTable'
import './App.css'

export default function App() {
  const { data, loading, error, refetch } = useDashboard()

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" />
          <div>
            <h1>Penn Dashboard</h1>
            <p className="subtitle">Business analytics overview</p>
          </div>
        </div>
        <div className="header-actions">
          <SourceBadge source={dataSource} />
          <button className="btn" onClick={refetch} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="banner banner-error">
            Failed to load data: {error.message}
            <button className="btn btn-sm" onClick={refetch}>
              Retry
            </button>
          </div>
        )}

        {loading && !data && <LoadingState />}

        {data && (
          <>
            <section className="kpi-grid">
              {data.kpis.map((kpi) => (
                <KpiCard key={kpi.id} kpi={kpi} />
              ))}
            </section>

            <section className="charts-grid">
              <RevenueChart data={data.timeseries} />
              <CategoryChart data={data.categories} />
            </section>

            <section>
              <TransactionsTable transactions={data.transactions} />
            </section>
          </>
        )}
      </main>

      <footer className="app-footer">
        <span>Penn Dashboard · {new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}

const SOURCE_META = {
  sheets: { label: 'Live · Google Sheets', className: 'source-live' },
  api: { label: 'Live · API', className: 'source-live' },
  sample: {
    label: 'Sample data',
    className: 'source-sample',
    title: 'Set VITE_GOOGLE_SHEET_ID + VITE_GOOGLE_API_KEY to use live data',
  },
}

function SourceBadge({ source }) {
  const meta = SOURCE_META[source] || SOURCE_META.sample
  return (
    <span className={`source-badge ${meta.className}`} title={meta.title}>
      {meta.label}
    </span>
  )
}

function LoadingState() {
  return (
    <div className="loading-state">
      <div className="spinner" />
      <p>Loading dashboard…</p>
    </div>
  )
}
