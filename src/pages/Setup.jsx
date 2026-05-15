import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMatch } from '../hooks/useMatch.js'
import TopBar from '../components/TopBar.jsx'

const OVERS_OPTIONS = [5, 6, 7, 8, 9, 10]

export default function Setup() {
  const navigate = useNavigate()
  const { createMatch } = useMatch()

  const [team1, setTeam1] = useState('Team A')
  const [team2, setTeam2] = useState('Team B')
  const [overs, setOvers] = useState(6)
  const [syncEnabled, setSyncEnabled] = useState(
    () => !!localStorage.getItem('turf_sheets_url')
  )
  const [sheetsUrl, setSheetsUrl] = useState(
    () => localStorage.getItem('turf_sheets_url') || ''
  )

  function handleNext() {
    if (!team1.trim() || !team2.trim()) return
    if (syncEnabled && sheetsUrl.trim()) localStorage.setItem('turf_sheets_url', sheetsUrl.trim())
    else if (!syncEnabled) localStorage.removeItem('turf_sheets_url')
    createMatch({ team1: team1.trim(), team2: team2.trim(), overs })
    navigate('/pick-teams')
  }

  return (
    <div className="page">
      <TopBar title="New Match" />

      <div className="section">
        <label className="label">Team 1 Name</label>
        <input className="input" value={team1} onChange={e => setTeam1(e.target.value)} placeholder="Team A" maxLength={24} />
      </div>

      <div className="section">
        <label className="label">Team 2 Name</label>
        <input className="input" value={team2} onChange={e => setTeam2(e.target.value)} placeholder="Team B" maxLength={24} />
      </div>

      <div className="section">
        <div className="label">Overs</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {OVERS_OPTIONS.map(o => (
            <button key={o} className={`pill ${overs === o ? 'active' : ''}`} onClick={() => setOvers(o)} style={{ minWidth: 52 }}>
              {o}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Sync to Google Sheets</div>
              <div className="text-muted text-xs">Advanced · optional</div>
            </div>
            <input
              type="checkbox"
              checked={syncEnabled}
              onChange={e => setSyncEnabled(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--green-accent)', cursor: 'pointer' }}
            />
          </div>
          {syncEnabled && (
            <div>
              <label className="label">Apps Script Web App URL</label>
              <input className="input" value={sheetsUrl} onChange={e => setSheetsUrl(e.target.value)} placeholder="https://script.google.com/macros/s/..." />
            </div>
          )}
        </div>
      </div>

      <div className="section">
        <button
          className="btn btn-primary btn-full"
          onClick={handleNext}
          disabled={!team1.trim() || !team2.trim()}
        >
          Next → Pick Teams
        </button>
      </div>
    </div>
  )
}
