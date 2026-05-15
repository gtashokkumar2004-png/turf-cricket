import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMatch } from '../hooks/useMatch.js'
import TopBar from '../components/TopBar.jsx'

// phase: 'call' | 'flipping' | 'reveal' | 'elect'

export default function Toss() {
  const navigate = useNavigate()
  const { match, setToss } = useMatch()

  const [phase, setPhase]       = useState('call')
  const [call, setCall]         = useState(null)   // 'heads' | 'tails'
  const [result, setResult]     = useState(null)   // 'heads' | 'tails'
  const [decision, setDecision] = useState('Bat')
  const [coinFace, setCoinFace] = useState('neutral') // 'neutral' | 'heads' | 'tails'
  const [isSpinning, setIsSpinning] = useState(false)

  if (!match) { navigate('/'); return null }

  const { team1, team2 } = match

  const tossWinner = result && call
    ? (call === result ? team1 : team2)
    : null

  function makeCall(side) {
    if (phase !== 'call') return
    setCall(side)
  }

  function flipCoin() {
    if (phase !== 'call' || !call) return

    const outcome = Math.random() < 0.5 ? 'heads' : 'tails'
    setResult(outcome)
    setPhase('flipping')
    setIsSpinning(true)

    // After spin animation (2.4s), reveal the correct face
    setTimeout(() => {
      setIsSpinning(false)
      setCoinFace(outcome)
      setPhase('reveal')
      setTimeout(() => setPhase('elect'), 1000)
    }, 2500)
  }

  function handleStart() {
    if (!tossWinner) return
    const battingFirst = decision === 'Bat' ? tossWinner : (tossWinner === team1 ? team2 : team1)
    setToss(tossWinner, battingFirst)
    // Auto-claim umpire: person setting up toss becomes first umpire
    localStorage.setItem('turf_umpire_active', '1')
    navigate('/umpire')
  }

  return (
    <div className="page">
      <TopBar title="Toss" />

      <div style={{ textAlign: 'center', padding: '6px 16px 0' }}>
        <p className="text-muted text-sm">{team1} vs {team2}</p>
      </div>

      {/* ── Coin ─── */}
      <div style={{ perspective: '700px', display: 'flex', justifyContent: 'center', padding: '28px 0 18px' }}>
        <div style={{
          width: 148, height: 148,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 36% 28%, #f4f4f2, #d8d8d4, #b0b0aa, #909088, #c0c0b8, #e8e8e0)',
          border: '3.5px solid #7a7a70',
          boxShadow: '0 0 0 1.5px #50504a, inset 0 2px 10px rgba(255,255,255,0.55), 0 10px 28px rgba(0,0,0,0.65)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          position: 'relative', flexShrink: 0,
          animation: isSpinning ? 'coinSpin 2.4s cubic-bezier(0.28, 0, 0.08, 1) forwards' : 'none',
        }}>
          {/* Inner engraved rim */}
          <div style={{
            position: 'absolute', inset: 10, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.4)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', inset: 13, borderRadius: '50%',
            border: '0.5px solid rgba(0,0,0,0.12)',
            pointerEvents: 'none',
          }} />

          {/* ── Heads face: Lion Capital ─── */}
          {coinFace === 'heads' && (
            <div style={{ textAlign: 'center', userSelect: 'none', animation: 'fadeInUp 0.35s ease' }}>
              <div style={{ fontSize: '2.2rem', lineHeight: 1 }}>🦁</div>
              <div style={{
                fontSize: '0.48rem', fontWeight: 900, color: '#3a3a30',
                letterSpacing: '0.14em', marginTop: 3, textTransform: 'uppercase',
              }}>
                INDIA · भारत
              </div>
              <div style={{ fontSize: '0.4rem', fontWeight: 700, color: '#6a6a58', marginTop: 1 }}>
                ★ 2024 ★
              </div>
            </div>
          )}

          {/* ── Tails face: Rupee ─── */}
          {coinFace === 'tails' && (
            <div style={{ textAlign: 'center', userSelect: 'none', animation: 'fadeInUp 0.35s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#5a5a48' }}>🌾</span>
                <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#3a3a30', lineHeight: 1 }}>₹</span>
                <span style={{ fontSize: '0.7rem', color: '#5a5a48' }}>🌾</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#3a3a30', lineHeight: 1, marginTop: 1 }}>1</div>
              <div style={{
                fontSize: '0.42rem', fontWeight: 900, color: '#6a6a58',
                letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 2,
              }}>
                RUPEE
              </div>
            </div>
          )}

          {/* ── Neutral face (before flip) ─── */}
          {coinFace === 'neutral' && (
            <div style={{ textAlign: 'center', userSelect: 'none' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#5a5a48', lineHeight: 1 }}>₹</div>
              <div style={{
                fontSize: '0.46rem', fontWeight: 900, color: '#888880',
                letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3,
              }}>
                INDIA
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Phase 1: Call ─── */}
      {phase === 'call' && (
        <div>
          <p style={{ textAlign: 'center', fontWeight: 700, color: 'var(--white)', padding: '0 16px 14px', fontSize: '1rem' }}>
            Call Heads or Tails before flipping!
          </p>

          <div style={{ display: 'flex', gap: 10, padding: '0 16px 12px' }}>
            {[['heads', '🦁 Heads'], ['tails', '₹ Tails']].map(([side, label]) => (
              <button
                key={side}
                className={`pill ${call === side ? 'active' : ''}`}
                style={{ flex: 1, fontSize: '1rem', minHeight: 52 }}
                onClick={() => makeCall(side)}
              >
                {label}
              </button>
            ))}
          </div>

          {call && (
            <div style={{ textAlign: 'center', padding: '0 16px 12px' }}>
              <span style={{
                background: 'rgba(16,185,129,0.15)', border: '1.5px solid var(--green-accent)',
                color: 'var(--green-accent)', borderRadius: 24, padding: '6px 18px',
                fontWeight: 800, fontSize: '0.9rem', display: 'inline-block',
              }}>
                {team1} called {call === 'heads' ? '🦁 Heads' : '₹ Tails'}
              </span>
            </div>
          )}

          <div style={{ padding: '4px 16px 12px' }}>
            <button
              className="btn btn-primary btn-full"
              style={{ fontSize: '1.05rem' }}
              disabled={!call}
              onClick={flipCoin}
            >
              🪙 Flip the Coin!
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem', minHeight: 36, padding: '6px 14px' }}
              onClick={() => setCall(null)}
            >
              Reset 🔄
            </button>
          </div>
        </div>
      )}

      {/* ── Phase 2: Flipping ─── */}
      {phase === 'flipping' && (
        <div style={{ textAlign: 'center', padding: '16px' }}>
          <p style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--yellow)' }}>
            Flipping... teams lean in 🤫
          </p>
        </div>
      )}

      {/* ── Phase 3: Reveal ─── */}
      {(phase === 'reveal' || phase === 'elect') && result && (
        <div style={{ textAlign: 'center', padding: '0 16px 16px', animation: 'fadeInUp 0.4s ease' }}>
          <div style={{
            fontSize: '2.2rem', fontWeight: 900,
            color: result === 'heads' ? 'var(--yellow)' : 'var(--green-accent)',
          }}>
            {result === 'heads' ? '🦁 HEADS!' : '₹ TAILS!'}
          </div>
          {tossWinner && (
            <div style={{ marginTop: 10, fontWeight: 800, fontSize: '1.05rem', color: 'var(--green-accent)' }}>
              ✅ {tossWinner} wins the toss!
            </div>
          )}
          {tossWinner && tossWinner !== team1 && (
            <div style={{ marginTop: 4, fontSize: '0.9rem', color: 'var(--muted)' }}>
              ❌ {team1} loses the toss.
            </div>
          )}
        </div>
      )}

      {/* ── Phase 4: Elect ─── */}
      {phase === 'elect' && tossWinner && (
        <div>
          <div className="section" style={{ paddingTop: 0 }}>
            <div className="label">{tossWinner} elects to…</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['Bat', '🏏 Bat'], ['Bowl', '🎳 Bowl']].map(([d, label]) => (
                <button key={d} className={`pill ${decision === d ? 'active' : ''}`} onClick={() => setDecision(d)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="section" style={{ paddingTop: 0 }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800 }}>
                {tossWinner} won &amp; elected to{' '}
                <span style={{ color: 'var(--green-accent)' }}>{decision.toLowerCase()}</span>
              </div>
              <div className="text-muted text-sm" style={{ marginTop: 6 }}>
                <strong style={{ color: 'var(--white)' }}>
                  {decision === 'Bat' ? tossWinner : (tossWinner === team1 ? team2 : team1)}
                </strong>{' '}will bat first
              </div>
            </div>
          </div>

          <div className="section" style={{ paddingTop: 0 }}>
            <button className="btn btn-primary btn-full" onClick={handleStart}>
              Start Match 🏏
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
