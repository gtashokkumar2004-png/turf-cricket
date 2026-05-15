import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMatch } from '../hooks/useMatch.js'
import { calcInningsStats } from '../utils/cricketCalc.js'
import BottomNav from '../components/BottomNav.jsx'
import InstallBanner from '../components/InstallBanner.jsx'
import HowToUseModal from '../components/HowToUseModal.jsx'
import TodayDashboard from '../components/TodayDashboard.jsx'

export default function Home() {
  const navigate = useNavigate()
  const { match, history } = useMatch()
  const [showHowTo, setShowHowTo] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('howto_seen')) {
      setShowHowTo(true)
      localStorage.setItem('howto_seen', '1')
    }
  }, [])

  const inn = match?.innings?.[match.currentInnings]
  const stats = inn ? calcInningsStats(inn.balls) : null

  function resumeOrScore() {
    if (!match) return
    if (match.status === 'toss') navigate('/toss')
    else if (match.status === 'complete') navigate(`/summary/${match.id}`, { state: { match } })
    else navigate('/score')
  }

  return (
    <div className="page" style={{ position: 'relative' }}>
      {/* Zuko Labs logo — top right corner */}
      <div className="top-right-logo">
        <img src="/zukolabs-logo.jpg" alt="Zuko Labs" className="corner-logo" />
      </div>

      {/* Hero */}
      <div style={{ background: 'var(--navy)', padding: '28px 16px 18px', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>🏏</div>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 900, marginTop: 10 }}>Turf Cricket</h1>
        <p className="text-muted text-sm" style={{ marginTop: 6 }}>Ball-by-ball scorer for your weekend matches</p>
        <div className="zuko-brand-pill">
          <span className="powered-text">Powered by</span>
          <span className="zuko-labs-text">ZUKO LABS</span>
        </div>
      </div>

      <InstallBanner />

      {/* Active match */}
      {match && match.status !== 'complete' ? (
        <div className="section">
          <div className="label">Active Match</div>
          <div className="active-match-card" onClick={resumeOrScore}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{match.team1} vs {match.team2}</div>
                <div className="text-muted text-xs" style={{ marginTop: 4 }}>{match.overs} overs · {match.date}</div>
              </div>
              {stats && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, color: 'var(--green-accent)', fontSize: '1.15rem' }}>{stats.runs}/{stats.wickets}</div>
                  <div className="text-muted text-xs">{stats.overs}.{stats.ballsInOver} ov</div>
                </div>
              )}
            </div>
            <div style={{ marginTop: 10, fontSize: '0.85rem', fontWeight: 700, color: 'var(--green-accent)' }}>
              Tap to resume →
            </div>
          </div>
        </div>
      ) : (
        <div className="section">
          <p className="hint">
            Tap <strong style={{ color: 'var(--green-accent)' }}>+ New Match</strong> to get started
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="section" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-primary btn-full" onClick={() => navigate('/setup')}>
          + New Match
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button className="btn btn-secondary btn-full" onClick={() => navigate('/history')}>📋 History</button>
          <button className="btn btn-secondary btn-full" onClick={() => navigate('/players')}>👥 Players</button>
        </div>
        <button className="btn btn-ghost btn-full" style={{ fontSize: '0.85rem' }} onClick={() => setShowHowTo(true)}>
          ❓ How to Use
        </button>
      </div>

      {/* Today's Dashboard */}
      <div style={{ margin: '8px 0 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <TodayDashboard history={history} />
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <span className="footer-text">Built with ❤️ for cricket</span>
        <a href="https://zukolabs.co.in" target="_blank" rel="noopener noreferrer" className="footer-link">
          zukolabs.co.in
        </a>
      </footer>

      {showHowTo && <HowToUseModal onClose={() => setShowHowTo(false)} />}
      <BottomNav />
    </div>
  )
}
