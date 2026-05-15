import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useMatch } from '../hooks/useMatch.js'
import ScorecardTable from '../components/ScorecardTable.jsx'
import TopBar from '../components/TopBar.jsx'

export default function Summary() {
  const navigate = useNavigate()
  const { matchId } = useParams()
  const location = useLocation()
  const { getMatchById, saveToHistory, match: activeMatch } = useMatch()
  const [tab, setTab] = useState(0)

  const fromState = location.state?.match
  const fromHistory = getMatchById(matchId)
  const displayMatch = fromState || fromHistory

  // Persist active match to history when arriving from Score
  useEffect(() => {
    if (fromState && activeMatch?.id === fromState.id) {
      saveToHistory()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!displayMatch) {
    return (
      <div className="page">
        <TopBar title="Match Summary" onBack={() => navigate('/history')} />
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p style={{ fontWeight: 700 }}>Match not found</p>
          <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate('/history')}>
            Back to History
          </button>
        </div>
      </div>
    )
  }

  const m = displayMatch
  const hasInnings2 = m.innings[1]?.balls?.length > 0

  return (
    <div className="page">
      <TopBar title="Match Summary" onBack={() => navigate('/history')} />

      {/* Result */}
      {m.winner && (
        <div className="result-banner" style={{ margin: '8px 16px 0' }}>
          {m.winner === 'Tie' ? '🤝 Match Tied!' : `🏆 ${m.winner} won by ${m.margin}`}
        </div>
      )}

      {/* Info chips */}
      <div style={{ padding: '10px 16px 0', display: 'flex', gap: 8 }}>
        {[
          { label: 'Date',   value: m.date },
          { label: 'Format', value: `${m.overs} Overs` },
          { label: 'Toss',   value: m.tossWinner ? `${m.tossWinner} · ${m.battingFirst === m.tossWinner ? 'Bat' : 'Bowl'}` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="card" style={{ flex: 1, textAlign: 'center', padding: '10px 8px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: 4 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Innings tabs */}
      {hasInnings2 && (
        <div className="tab-bar" style={{ marginTop: 12 }}>
          {m.innings.map((inn, i) => inn.balls.length > 0 && (
            <button key={i} className={`tab-btn ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>
              {inn.battingTeam || `Innings ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <ScorecardTable innings={m.innings[tab]} overs={m.overs} />

      <div style={{ padding: '0 16px 28px' }}>
        <button className="btn btn-secondary btn-full" onClick={() => navigate('/')}>🏠 Home</button>
      </div>
    </div>
  )
}
