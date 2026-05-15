import { useNavigate, useLocation } from 'react-router-dom'
import { useMatch } from '../hooks/useMatch.js'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { match } = useMatch()

  const scoreRoutes = ['/score', '/umpire', '/scorecard', '/toss']
  const scoreActive = scoreRoutes.includes(location.pathname)
  const showDot = match && (match.status === 'innings1' || match.status === 'innings2')

  function handleScoreTab() {
    if (!match) return
    if (match.status === 'complete') {
      navigate(`/summary/${match.id}`)
    } else if (match.status === 'toss') {
      navigate('/toss')
    } else {
      navigate('/score')
    }
  }

  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        <span>🏠</span>
        <span>Home</span>
      </button>

      <button
        className={`nav-item ${scoreActive ? 'active' : ''}`}
        onClick={handleScoreTab}
        disabled={!match}
        style={{ opacity: match ? 1 : 0.4 }}
      >
        <span style={{ position: 'relative', display: 'inline-block' }}>
          🏏
          {showDot && (
            <span style={{
              position: 'absolute', top: -2, right: -5,
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--green-accent)', display: 'block',
            }} />
          )}
        </span>
        <span>Score</span>
      </button>

      <button
        className={`nav-item ${location.pathname === '/history' ? 'active' : ''}`}
        onClick={() => navigate('/history')}
      >
        <span>📋</span>
        <span>History</span>
      </button>

      <button
        className={`nav-item ${location.pathname === '/players' ? 'active' : ''}`}
        onClick={() => navigate('/players')}
      >
        <span>👥</span>
        <span>Players</span>
      </button>
    </nav>
  )
}
