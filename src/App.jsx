import { useDashboard } from './hooks/useDashboard'
import { dataSource } from './api/client'
import { KpiCard } from './components/KpiCard'
import { BreakdownChart } from './components/BreakdownChart'
import { ContactsTable } from './components/ContactsTable'
import { FinanceSection } from './components/FinanceSection'
import './App.css'

export default function App() {
  const { model, loading, error, refetch } = useDashboard()

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" />
          <div>
            <h1>Penn Dashboard</h1>
            <p className="subtitle">The Penn Enterprises · Outreach overview</p>
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

        {loading && !model && <LoadingState />}

        {model && (
          <>
            <section className="kpi-grid">
              {model.kpis.map((kpi) => (
                <KpiCard key={kpi.id} kpi={kpi} />
              ))}
            </section>

            <section className="charts-grid">
              <BreakdownChart title="Outreach Status" data={model.statusBreakdown} />
              <BreakdownChart title="Leads by Source" data={model.sourceBreakdown} />
            </section>

            <section>
              <ContactsTable contacts={model.contacts} />
            </section>

            <FinanceSection />
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
  api: { label: 'Live · Proxy', className: 'source-live' },
  sample: {
    label: 'Sample data',
    className: 'source-sample',
    title: 'Set VITE_API_BASE_URL to your backend proxy to use live data',
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
