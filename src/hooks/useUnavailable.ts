import { useState, useCallback } from 'react'
import { useAuthStore } from '../stores/authStore'

export function useUnavailable() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const [show, setShow] = useState(false)

  const guard = useCallback(() => {
    if (!isDemo) {
      setShow(true)
      return true
    }
    return false
  }, [isDemo])

  const close = useCallback(() => setShow(false), [])

  return { isDemo, show, guard, close }
}
