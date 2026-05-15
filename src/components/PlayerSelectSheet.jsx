import { useState } from 'react'

/**
 * Bottom sheet to pick a player from a list.
 * Props: title, players (string[]), exclude (string[]), onSelect(name), onClose
 */
export default function PlayerSelectSheet({ title, players = [], exclude = [], onSelect, onClose }) {
  const [search, setSearch] = useState('')

  const filtered = players.filter(p =>
    p && !exclude.includes(p) && p.toLowerCase().includes(search.toLowerCase())
  )

  function pick(name) { onSelect(name); onClose() }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-title">{title}</div>
        <input
          className="input"
          placeholder="Search player..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
          style={{ marginBottom: 12 }}
        />
        {filtered.length === 0 && (
          <p className="hint">No players found. Add them in the Players tab.</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(p => (
            <button key={p} className="btn btn-ghost" style={{ justifyContent: 'flex-start', borderRadius: 10 }} onClick={() => pick(p)}>
              👤 {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
