import { useState, useEffect } from 'react'

export default function InstallBanner() {
  const [prompt, setPrompt] = useState(null)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('install_dismissed') === '1'
  )

  useEffect(() => {
    function handler(e) {
      e.preventDefault()
      setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!prompt || dismissed) return null

  function install() {
    prompt.prompt()
    prompt.userChoice.then(() => setPrompt(null))
  }

  function dismiss() {
    localStorage.setItem('install_dismissed', '1')
    setDismissed(true)
  }

  return (
    <div className="install-banner">
      <span style={{ fontSize: '1.6rem' }}>📲</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Install Turf Cricket</div>
        <div className="text-muted text-sm">Use offline, home screen shortcut</div>
      </div>
      <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }} onClick={install}>
        Install
      </button>
      <button className="btn btn-ghost" style={{ padding: '8px', fontSize: '1rem', minHeight: 36 }} onClick={dismiss}>
        ✕
      </button>
    </div>
  )
}
