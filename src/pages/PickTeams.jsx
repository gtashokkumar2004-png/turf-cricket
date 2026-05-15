import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMatch } from '../hooks/useMatch.js'
import TopBar from '../components/TopBar.jsx'

const LONG_MS = 620

function loadPool() {
  try {
    const r = localStorage.getItem('turf_pool')
    return r ? JSON.parse(r) : []
  } catch { return [] }
}

export default function PickTeams() {
  const navigate = useNavigate()
  const { match, setMatchPlayers } = useMatch()

  if (!match) { navigate('/setup'); return null }

  const pool = loadPool()
  const [assign, setAssign] = useState({})   // name → 'team1' | 'team2' | undefined
  const [absent, setAbsent] = useState(new Set())

  const t1 = pool.filter(p => assign[p] === 'team1' && !absent.has(p))
  const t2 = pool.filter(p => assign[p] === 'team2' && !absent.has(p))
  const canProceed = t1.length >= 2 && t2.length >= 2

  function cyclePlayer(name) {
    if (absent.has(name)) return
    setAssign(prev => {
      const cur = prev[name]
      if (!cur)           return { ...prev, [name]: 'team1' }
      if (cur === 'team1') return { ...prev, [name]: 'team2' }
      const next = { ...prev }; delete next[name]; return next
    })
  }

  function toggleAbsent(name) {
    setAbsent(prev => {
      const s = new Set(prev)
      if (s.has(name)) { s.delete(name) }
      else {
        s.add(name)
        setAssign(a => { const n = { ...a }; delete n[name]; return n })
      }
      return s
    })
  }

  function handleNext() {
    setMatchPlayers({ [match.team1]: t1, [match.team2]: t2 })
    navigate('/toss')
  }

  if (pool.length === 0) {
    return (
      <div className="page">
        <TopBar title="Pick Teams" />
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <p style={{ fontWeight: 700 }}>No players in pool</p>
          <p className="text-muted text-sm">Add players in the Players tab first</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/players')}>Go to Players</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page" style={{ paddingBottom: 96 }}>
      <TopBar title="Pick Teams" />

      {/* Team counters */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px 0' }}>
        <TeamCounter label={match.team1} count={t1.length} color="var(--green-accent)" accent="rgba(16,185,129,0.2)" border="var(--green-accent)" />
        <TeamCounter label={match.team2} count={t2.length} color="var(--yellow)" accent="rgba(245,158,11,0.15)" border="var(--yellow)" />
      </div>

      <p className="hint" style={{ padding: '8px 16px 4px' }}>
        Tap to assign &nbsp;·&nbsp; Long-press to mark absent
      </p>
      <p style={{ padding: '0 16px 10px', fontSize: '0.75rem', color: 'var(--muted)' }}>
        <span style={{ color: 'var(--green-accent)', fontWeight: 800 }}>■</span> {match.team1} &nbsp;&nbsp;
        <span style={{ color: 'var(--yellow)', fontWeight: 800 }}>■</span> {match.team2} &nbsp;&nbsp;
        <span style={{ color: 'var(--muted)', fontWeight: 800 }}>■</span> Unassigned
      </p>

      {/* Player chips */}
      <div style={{ padding: '0 16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {pool.map(name => {
          const a = assign[name]
          const isAbsent = absent.has(name)
          const isT1 = a === 'team1' && !isAbsent
          const isT2 = a === 'team2' && !isAbsent

          return (
            <LongPressChip
              key={name}
              onClick={() => cyclePlayer(name)}
              onLongPress={() => toggleAbsent(name)}
              style={{
                background: isAbsent ? 'rgba(255,255,255,0.04)'
                  : isT1 ? 'rgba(16,185,129,0.22)'
                  : isT2 ? 'rgba(245,158,11,0.22)'
                  : 'rgba(255,255,255,0.09)',
                color: isAbsent ? 'var(--muted)' : isT1 ? 'var(--green-accent)' : isT2 ? 'var(--yellow)' : 'var(--white)',
                border: `1.5px solid ${isAbsent ? 'transparent' : isT1 ? 'var(--green-accent)' : isT2 ? 'var(--yellow)' : 'transparent'}`,
                textDecoration: isAbsent ? 'line-through' : 'none',
                opacity: isAbsent ? 0.45 : 1,
              }}
            >
              {name}
              {isT1 && <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: 5 }}>T1</span>}
              {isT2 && <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: 5 }}>T2</span>}
              {isAbsent && <span style={{ fontSize: '0.7rem', marginLeft: 5 }}>absent</span>}
            </LongPressChip>
          )
        })}
      </div>

      {/* Bottom CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, padding: '12px 16px 20px', background: 'var(--green-dark)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {!canProceed && (
          <p className="hint" style={{ marginBottom: 8 }}>
            Both teams need at least 2 players (T1: {t1.length}, T2: {t2.length})
          </p>
        )}
        <button className="btn btn-primary btn-full" disabled={!canProceed} onClick={handleNext}>
          Next → Toss
        </button>
      </div>
    </div>
  )
}

function TeamCounter({ label, count, color, accent, border }) {
  return (
    <div style={{ flex: 1, background: accent, borderRadius: 10, padding: '10px 8px', textAlign: 'center', border: `1.5px solid ${border}` }}>
      <div style={{ fontWeight: 800, color, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 900, color, lineHeight: 1.1 }}>{count}</div>
      <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>players</div>
    </div>
  )
}

function LongPressChip({ children, onClick, onLongPress, style }) {
  const timer = useRef(null)
  const fired = useRef(false)

  function down() {
    fired.current = false
    timer.current = setTimeout(() => { fired.current = true; onLongPress() }, LONG_MS)
  }
  function up() { clearTimeout(timer.current) }
  function click() { if (!fired.current) onClick() }

  return (
    <div
      style={{
        borderRadius: 24, padding: '10px 16px',
        fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.9rem',
        cursor: 'pointer', minHeight: 44,
        display: 'inline-flex', alignItems: 'center', userSelect: 'none',
        transition: 'all 0.12s', ...style,
      }}
      onClick={click}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
    >
      {children}
    </div>
  )
}
