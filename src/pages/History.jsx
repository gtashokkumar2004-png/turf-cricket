import { useNavigate } from 'react-router-dom'
import { useMatch } from '../hooks/useMatch.js'
import { calcInningsStats } from '../utils/cricketCalc.js'
import BottomNav from '../components/BottomNav.jsx'
import TopBar from '../components/TopBar.jsx'

export default function History() {
  const navigate = useNavigate()
  const { history } = useMatch()

  return (
    <div className="page">
      <TopBar title="Match History" />

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>No matches yet</p>
          <p className="text-muted text-sm">Completed matches appear here</p>
        </div>
      ) : (
        <div className="section" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {history.map(m => {
            const s0 = m.innings[0]?.balls?.length ? calcInningsStats(m.innings[0].balls) : null
            const s1 = m.innings[1]?.balls?.length ? calcInningsStats(m.innings[1].balls) : null
            return (
              <div
                key={m.id}
                className="card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/summary/${m.id}`, { state: { match: m } })}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{m.team1} vs {m.team2}</div>
                    <div className="text-muted text-xs" style={{ marginTop: 4 }}>{m.date} · {m.overs} overs</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {s0 && <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s0.runs}/{s0.wickets}</div>}
                    {s1 && <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s1.runs}/{s1.wickets}</div>}
                  </div>
                </div>
                {m.winner && (
                  <div style={{ marginTop: 8, fontSize: '0.85rem', fontWeight: 700, color: 'var(--green-accent)' }}>
                    {m.winner === 'Tie' ? '🤝 Tied' : `🏆 ${m.winner} won by ${m.margin}`}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
