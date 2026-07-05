import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchExpenses } from '../api/client'
import { buildExpensesModel } from '../lib/aggregate'

/**
 * Loads expenses from the active data source and derives the finance view
 * model. Fetched independently of the outreach data so a missing Expenses
 * tab (available: false) never affects the rest of the dashboard.
 */
export function useExpenses() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchExpenses()
      setResult(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const model = useMemo(
    () =>
      result && result.available && result.expenses.length
        ? buildExpensesModel(result.expenses)
        : null,
    [result],
  )

  return {
    model,
    available: result ? result.available && result.expenses.length > 0 : true,
    loading,
    error,
    refetch: load,
  }
}
