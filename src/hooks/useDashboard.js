import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchContacts } from '../api/client'
import { buildViewModel } from '../lib/aggregate'

/**
 * Loads contacts from the active data source and derives the dashboard view
 * model. Exposes loading / error / refetch state.
 */
export function useDashboard() {
  const [contacts, setContacts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchContacts()
      setContacts(data)
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
    () => (contacts ? buildViewModel(contacts) : null),
    [contacts],
  )

  return { model, loading, error, refetch: load }
}
