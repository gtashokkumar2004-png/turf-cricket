import { useState, useEffect } from 'react'

const KEY = 'turf_umpire_active'

export function useUmpireLock() {
  const [locked, setLocked] = useState(() => localStorage.getItem(KEY) === '1')

  // Sync across browser tabs on the same device
  useEffect(() => {
    function onStorage(e) {
      if (e.key === KEY) setLocked(e.newValue === '1')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function claim() {
    localStorage.setItem(KEY, '1')
    setLocked(true)
  }

  function release() {
    localStorage.removeItem(KEY)
    setLocked(false)
  }

  return { isLocked: locked, claim, release }
}
