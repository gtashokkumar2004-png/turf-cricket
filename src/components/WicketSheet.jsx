const TYPES = ['Bowled', 'Caught', 'LBW', 'Run Out', 'Stumped', 'Hit Wicket']

/**
 * Bottom sheet to select wicket type.
 * Props: onSelect(type), onClose
 */
export default function WicketSheet({ onSelect, onClose }) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-title">How was the wicket taken?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TYPES.map(t => (
            <button
              key={t}
              className="btn btn-danger"
              style={{ justifyContent: 'flex-start', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' }}
              onClick={() => { onSelect(t); onClose() }}
            >
              🔴 {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
