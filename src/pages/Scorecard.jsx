import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMatch } from '../hooks/useMatch.js'
import { calcInningsStats } from '../utils/cricketCalc.js'
import ScorecardTable from '../components/ScorecardTable.jsx'
import TopBar from '../components/TopBar.jsx'

export default function Scorecard() {
  const navigate = useNavigate()
  const { match } = useMatch()
  const [tab, setTab] = useState(0)

  if (!match) { navigate('/'); return null }

  const inn = match.innings[tab]

  return (
    <div className="page">
      <TopBar title="Scorecard" />

      {/* Match summary chips */}
      <div style={{ padding: '10px 16px 0', display: 'flex', gap: 8 }}>
        {match.innings.map((inn2, i) => {
          const s = inn2.balls.length ? calcInningsStats(inn2.balls) : null
          return (
            <div key={i} style={{ flex: 1, background: 'var(--green-mid)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>
                {inn2.battingTeam || `Inn ${i + 1}`}
              </div>
              {s ? (
                <>
                  <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--green-accent)' }}>{s.runs}/{s.wickets}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{s.overs}.{s.ballsInOver} ov</div>
                </>
              ) : (
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4 }}>Yet to bat</div>
              )}
            </div>
          )
        })}
      </div>

      {match.winner && (
        <div className="result-banner" style={{ margin: '10px 16px 0' }}>
          {match.winner === 'Tie' ? '🤝 Match Tied!' : `🏆 ${match.winner} won by ${match.margin}`}
        </div>
      )}

      {match.status !== 'complete' && (
        <div style={{ padding: '10px 16px 0', textAlign: 'right' }}>
          <button
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            onClick={() => navigate(localStorage.getItem('turf_umpire_active') === '1' ? '/umpire' : '/score')}
          >
            ◀ Back to Scoring
          </button>
        </div>
      )}

      <div className="tab-bar" style={{ marginTop: 8 }}>
        {match.innings.map((inn2, i) => (
          <button key={i} className={`tab-btn ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>
            {inn2.battingTeam || `Innings ${i + 1}`}
          </button>
        ))}
      </div>

      <ScorecardTable innings={inn} overs={match.overs} />
    </div>
  )
}
