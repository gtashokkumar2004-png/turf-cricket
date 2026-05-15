import { useNavigate } from 'react-router-dom'
import { useMatch } from '../hooks/useMatch.js'
import { useUmpireLock } from '../hooks/useUmpireLock.js'
import {
  calcInningsStats, getCurrentOverBalls,
  getBatsmanStats, getBowlerStats, getOversBreakdown,
  ballLabel, ballColor,
} from '../utils/cricketCalc.js'
import BallCircle from '../components/BallCircle.jsx'
import BottomNav from '../components/BottomNav.jsx'

// ─── Style constants (IPL broadcast palette) ──────────────────────────────────
const TH = {
  textAlign: 'center', padding: '6px 8px',
  color: 'var(--muted)', fontSize: '0.62rem', fontWeight: 900,
  textTransform: 'uppercase', letterSpacing: '0.08em',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
}
const TH_L = { ...TH, textAlign: 'left', paddingLeft: 14 }
const TD = {
  textAlign: 'center', padding: '9px 8px',
  color: 'var(--muted)', fontSize: '0.82rem',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
}
const TD_W = (color) => ({ ...TD, fontWeight: 800, color: color || 'var(--white)' })
const TD_C = (color) => ({ ...TD, color })

// ─── Sub-components ────────────────────────────────────────────────────────────

function LiveHeader() {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #022c22 0%, #064e3b 100%)',
      padding: '10px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '2px solid rgba(16,185,129,0.35)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{
          display: 'inline-block', width: 9, height: 9, borderRadius: '50%',
          background: '#ef4444', animation: 'livePulse 1.4s ease-in-out infinite',
        }} />
        <span style={{ fontWeight: 900, fontSize: '0.7rem', color: '#ef4444', letterSpacing: '0.18em' }}>
          LIVE
        </span>
      </div>
      <span style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--white)', letterSpacing: '-0.01em' }}>
        🏏 Turf Cricket
      </span>
      <div style={{ width: 48 }} />
    </div>
  )
}

function Section({ label, accent, children }) {
  return (
    <div style={{ margin: '8px 16px 0', background: 'var(--green-mid)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{
        padding: '7px 14px 5px',
        fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase',
        letterSpacing: '0.13em', color: accent || 'var(--muted)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function UmpireBar({ isLocked, onClaim }) {
  return (
    <div style={{ padding: '14px 16px 8px' }}>
      {isLocked ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          background: 'rgba(16,185,129,0.07)',
          border: '1px solid rgba(16,185,129,0.18)',
          borderRadius: 10, padding: '11px 14px',
        }}>
          <span style={{
            width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
            background: 'var(--green-accent)', display: 'inline-block',
            animation: 'livePulse 1.4s ease-in-out infinite',
          }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--muted)' }}>
            Umpire session active · Scoring in progress
          </span>
        </div>
      ) : (
        <button className="btn btn-secondary btn-full" style={{ fontSize: '1rem' }} onClick={onClaim}>
          🎙️ Claim Umpire
        </button>
      )}
    </div>
  )
}

// IPL-style square ball box used inside the score band
const BALL_STYLES = {
  wicket: { bg: '#ef4444',              border: '#dc2626', text: '#fff'     },
  four:   { bg: '#2563eb',              border: '#1d4ed8', text: '#fff'     },
  six:    { bg: '#7c3aed',              border: '#6d28d9', text: '#fff'     },
  extra:  { bg: '#d97706',              border: '#b45309', text: '#000'     },
  runs:   { bg: 'rgba(16,185,129,0.8)', border: '#059669', text: '#022c22' },
  dot:    { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.18)', text: 'rgba(255,255,255,0.45)' },
}

function OverBall({ ball }) {
  if (!ball) {
    return (
      <div style={{
        width: 40, height: 40, borderRadius: 7, flexShrink: 0,
        border: '1.5px dashed rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.04)',
      }} />
    )
  }
  const { bg, border, text } = BALL_STYLES[ballColor(ball)] || BALL_STYLES.dot
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 7, flexShrink: 0,
      background: bg, border: `1.5px solid ${border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.88rem', fontWeight: 900, color: text,
      fontFamily: 'Nunito, sans-serif',
    }}>
      {ballLabel(ball)}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function LiveView() {
  const navigate = useNavigate()
  const { match } = useMatch()
  const { isLocked, claim } = useUmpireLock()

  function handleClaim() {
    claim()
    navigate('/umpire')
  }

  // ── No match ─────────────────────────────────────────────────────────────────
  if (!match) {
    return (
      <div className="page">
        <LiveHeader />
        <div className="empty-state">
          <div className="empty-icon">🏏</div>
          <p style={{ fontWeight: 700, fontSize: '1.05rem' }}>No active match</p>
          <p className="text-muted text-sm">Start a new match to see live scores here</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
            Go to Home
          </button>
        </div>
        <BottomNav />
      </div>
    )
  }

  // ── Toss pending ──────────────────────────────────────────────────────────────
  if (match.status === 'toss') {
    return (
      <div className="page">
        <LiveHeader />
        <div style={{ textAlign: 'center', padding: '48px 24px 32px' }}>
          <div style={{ fontSize: '3rem' }}>🪙</div>
          <div style={{ fontWeight: 900, fontSize: '1.3rem', marginTop: 14, color: 'var(--white)' }}>
            {match.team1} vs {match.team2}
          </div>
          <div className="text-muted text-sm" style={{ marginTop: 6 }}>{match.overs} overs · Toss in progress</div>
          <button className="btn btn-secondary" style={{ marginTop: 24 }} onClick={() => navigate('/toss')}>
            Go to Toss →
          </button>
        </div>
        <UmpireBar isLocked={isLocked} onClaim={handleClaim} />
        <BottomNav />
      </div>
    )
  }

  // ── Match complete ────────────────────────────────────────────────────────────
  if (match.status === 'complete') {
    const s0 = calcInningsStats(match.innings[0].balls)
    const s1 = match.innings[1]?.balls?.length ? calcInningsStats(match.innings[1].balls) : null
    return (
      <div className="page">
        <LiveHeader />
        {match.winner && (
          <div className="result-banner" style={{ margin: '12px 16px 0' }}>
            {match.winner === 'Tie' ? '🤝 Match Tied!' : `🏆 ${match.winner} won by ${match.margin}`}
          </div>
        )}
        <div style={{ padding: '12px 16px 0', display: 'flex', gap: 8 }}>
          {[match.innings[0], match.innings[1]].map((inn2, i) => {
            if (!inn2?.balls?.length && i === 1) return null
            const s = i === 0 ? s0 : s1
            return (
              <div key={i} className="card" style={{ flex: 1, textAlign: 'center', padding: '12px 8px' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {inn2.battingTeam || `Inn ${i + 1}`}
                </div>
                {s ? (
                  <>
                    <div style={{ fontWeight: 900, fontSize: '1.6rem', color: 'var(--green-accent)', marginTop: 4 }}>
                      {s.runs}<span style={{ fontSize: '1rem', color: 'var(--white)' }}>/{s.wickets}</span>
                    </div>
                    <div className="text-muted text-xs">{s.overs}.{s.ballsInOver} ov · RR {s.rr}</div>
                  </>
                ) : (
                  <div className="text-muted text-sm" style={{ marginTop: 6 }}>Yet to bat</div>
                )}
              </div>
            )
          })}
        </div>
        <div style={{ padding: '16px' }}>
          <button className="btn btn-secondary btn-full" onClick={() => navigate(`/summary/${match.id}`, { state: { match } })}>
            View Full Scorecard →
          </button>
        </div>
        <BottomNav />
      </div>
    )
  }

  // ── Live innings ──────────────────────────────────────────────────────────────
  const inn    = match.innings[match.currentInnings]
  const stats  = calcInningsStats(inn.balls)
  const overBalls   = getCurrentOverBalls(inn.balls)
  const legalInOver = overBalls.filter(b => b.extras !== 'Wide' && b.extras !== 'No Ball').length
  const maxBalls    = match.overs * 6

  const strikerSlot    = match.strikerIndex
  const nonStrikerSlot = 1 - match.strikerIndex
  const strikerName    = match.currentBatsmen[strikerSlot]  || ''
  const nonStrikerName = match.currentBatsmen[nonStrikerSlot] || ''
  const bowler         = match.currentBowler || ''

  const inn0Stats   = match.currentInnings === 1 ? calcInningsStats(match.innings[0].balls) : null
  const target      = inn0Stats ? inn0Stats.runs + 1 : null
  const needed      = target !== null ? target - stats.runs : null
  const remainBalls = maxBalls - stats.legalBalls
  const rrr = (needed !== null && needed > 0 && remainBalls > 0)
    ? ((needed / remainBalls) * 6).toFixed(1)
    : (needed !== null && needed <= 0) ? '—' : '0.0'

  const bowlerStats = bowler ? getBowlerStats(inn.balls, bowler) : null

  // Last 4 fully-completed overs
  const allOvers = getOversBreakdown(inn.balls, match.overs)
  const completedOvers = allOvers
    .filter(ov => ov.balls.filter(b => b.extras !== 'Wide' && b.extras !== 'No Ball').length === 6)
    .slice(-4)
    .reverse()

  // Fall of wickets (last 3)
  const fallOfWickets = (() => {
    const fow = []
    let runs = 0, legal = 0
    for (const b of inn.balls) {
      const isWide = b.extras === 'Wide'
      const isNB   = b.extras === 'No Ball'
      runs += b.runs + (isWide || isNB ? 1 : 0)
      if (!isWide && !isNB) legal++
      if (b.wicket) {
        const wkts = fow.length + 1
        fow.push({ wkts, runs, over: `${Math.floor(legal / 6)}.${legal % 6}`, name: b.batsman })
      }
    }
    return fow.slice(-3)
  })()

  return (
    <div className="page" style={{ paddingBottom: 80 }}>
      <LiveHeader />

      {/* Match context strip */}
      <div style={{
        background: 'rgba(0,0,0,0.25)', padding: '5px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--muted)' }}>
          {match.team1} vs {match.team2}
        </span>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)' }}>
          {match.currentInnings === 0 ? '1st Innings' : '2nd Innings'} · {match.overs} ov
        </span>
      </div>

      {/* ── SCORE BAND ─────────────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--navy)', padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>

          {/* Left: batting team + big score */}
          <div>
            <div style={{
              fontSize: '0.62rem', fontWeight: 900, color: 'var(--green-accent)',
              textTransform: 'uppercase', letterSpacing: '0.12em',
            }}>
              {inn.battingTeam || '—'}
            </div>
            <div style={{ marginTop: 2, lineHeight: 1 }}>
              <span style={{ fontSize: '3.6rem', fontWeight: 900, color: 'var(--green-accent)', lineHeight: 1 }}>
                {stats.runs}
              </span>
              <span style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--white)' }}>
                /{stats.wickets}
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--muted)', marginTop: 5 }}>
              ({stats.overs}.{stats.ballsInOver} / {match.overs} ov)
            </div>
          </div>

          {/* Right: CRR + RRR */}
          <div style={{ textAlign: 'right' }}>
            <div>
              <div style={{ fontSize: '0.58rem', fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                CRR
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--yellow)' }}>
                {stats.rr}
              </div>
            </div>
            {target !== null && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: '0.58rem', fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  RRR
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 900, color: needed <= 0 ? 'var(--green-accent)' : 'var(--red)' }}>
                  {rrr}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Target chase banner */}
        {target !== null && (
          <div style={{
            marginTop: 10,
            background: needed > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.15)',
            border: `1px solid ${needed > 0 ? 'rgba(239,68,68,0.28)' : 'rgba(16,185,129,0.4)'}`,
            borderRadius: 8, padding: '8px 13px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            {needed > 0 ? (
              <>
                <span style={{ color: 'var(--yellow)', fontWeight: 800, fontSize: '0.9rem' }}>
                  Need {needed} off {remainBalls} ball{remainBalls !== 1 ? 's' : ''}
                </span>
                <span style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700 }}>
                  Target {target}
                </span>
              </>
            ) : (() => {
                const wktsLeft = 10 - stats.wickets
                return (
                  <span style={{ color: 'var(--green-accent)', fontWeight: 800, fontSize: '0.9rem' }}>
                    🏆 {inn.battingTeam} won by {wktsLeft} wicket{wktsLeft !== 1 ? 's' : ''} &amp; {remainBalls} ball{remainBalls !== 1 ? 's' : ''} to spare
                  </span>
                )
              })()}
          </div>
        )}

        {/* ── THIS OVER — embedded in score band (IPL style) ─── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 14, paddingTop: 11, paddingBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

            {/* Bowler name block */}
            <div style={{ minWidth: 66, maxWidth: 66 }}>
              <div style={{ fontSize: '0.52rem', fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.13em', marginBottom: 3 }}>
                Ov {stats.overs + 1}
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {bowler || '—'}
              </div>
            </div>

            {/* Vertical divider */}
            <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

            {/* Ball boxes */}
            <div style={{ display: 'flex', gap: 6, flex: 1, alignItems: 'center' }}>
              {overBalls.map(b => <OverBall key={b.id} ball={b} />)}
              {Array.from({ length: Math.max(0, 6 - legalInOver) }).map((_, i) => (
                <OverBall key={`em${i}`} ball={null} />
              ))}
            </div>

            {/* Over run tally */}
            {overBalls.length > 0 && (
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.52rem', fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>RUNS</div>
                <div style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--white)', lineHeight: 1 }}>
                  {overBalls.reduce((s, b) => s + b.runs + (b.extras === 'Wide' || b.extras === 'No Ball' ? 1 : 0), 0)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1st innings summary strip (2nd innings only) */}
      {inn0Stats && (
        <div style={{
          background: 'rgba(16,185,129,0.07)',
          borderBottom: '1px solid rgba(16,185,129,0.12)',
          padding: '6px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700 }}>
            {match.innings[0].battingTeam} · 1st Inn
          </span>
          <span style={{ fontWeight: 900, fontSize: '0.88rem', color: 'var(--white)' }}>
            {inn0Stats.runs}/{inn0Stats.wickets} ({inn0Stats.overs}.{inn0Stats.ballsInOver} ov)
          </span>
        </div>
      )}

      {/* ── BATTING ──────────────────────────────────────────────────────────────── */}
      <Section label="BATTING" accent="var(--green-accent)">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={TH_L}>Batter</th>
              <th style={TH}>R</th>
              <th style={TH}>B</th>
              <th style={TH}>4s</th>
              <th style={TH}>6s</th>
              <th style={TH}>SR</th>
            </tr>
          </thead>
          <tbody>
            {strikerName || nonStrikerName ? (
              [
                { slot: strikerSlot,    name: strikerName,    isStriker: true  },
                { slot: nonStrikerSlot, name: nonStrikerName, isStriker: false },
              ].map(({ slot, name, isStriker }) => {
                if (!name) return null
                const bs = getBatsmanStats(inn.balls, name)
                return (
                  <tr key={slot} style={{ background: isStriker ? 'rgba(245,158,11,0.07)' : 'transparent' }}>
                    <td style={{ ...TD_W(isStriker ? 'var(--yellow)' : 'var(--white)'), textAlign: 'left', paddingLeft: 14 }}>
                      {isStriker
                        ? <span style={{ fontSize: '0.7rem', marginRight: 5, color: 'var(--yellow)' }}>▶</span>
                        : <span style={{ fontSize: '0.7rem', marginRight: 5, opacity: 0.4 }}>◌</span>}
                      {name}
                    </td>
                    <td style={TD_W(isStriker ? 'var(--yellow)' : 'var(--white)')}>{bs.runs}</td>
                    <td style={TD}>{bs.ballsFaced}</td>
                    <td style={TD_C('var(--blue)')}>{bs.fours}</td>
                    <td style={TD_C('var(--purple)')}>{bs.sixes}</td>
                    <td style={TD_C('var(--green-accent)')}>{bs.sr}</td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ ...TD, textAlign: 'left', paddingLeft: 14, fontStyle: 'italic' }}>
                  Awaiting batsmen...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Section>

      {/* ── BOWLING ──────────────────────────────────────────────────────────────── */}
      {bowlerStats && (
        <Section label="BOWLING" accent="var(--muted)">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH_L}>Bowler</th>
                <th style={TH}>O</th>
                <th style={TH}>R</th>
                <th style={TH}>W</th>
                <th style={TH}>ECO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...TD_W('var(--white)'), textAlign: 'left', paddingLeft: 14 }}>
                  {bowler}
                </td>
                <td style={TD}>{bowlerStats.oversStr}</td>
                <td style={TD}>{bowlerStats.runs}</td>
                <td style={TD_W('var(--red)')}>{bowlerStats.wickets}</td>
                <td style={TD_C('var(--muted)')}>{bowlerStats.eco}</td>
              </tr>
            </tbody>
          </table>
        </Section>
      )}

      {/* ── RECENT OVERS ─────────────────────────────────────────────────────────── */}
      {completedOvers.length > 0 && (
        <Section label="RECENT OVERS" accent="var(--muted)">
          <div style={{ padding: '10px 14px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {completedOvers.map(({ overIndex, balls: oBalls, total }) => {
              const overBowler = oBalls[0]?.bowler || `Ov ${overIndex + 1}`
              return (
                <div key={overIndex} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ minWidth: 64, maxWidth: 64 }}>
                    <div style={{
                      fontSize: '0.72rem', fontWeight: 800, color: 'var(--white)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {overBowler}
                    </div>
                    <div style={{ fontSize: '0.58rem', color: 'var(--muted)', marginTop: 1 }}>
                      Ov {overIndex + 1}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flex: 1, flexWrap: 'wrap' }}>
                    {oBalls.map(b => <BallCircle key={b.id} ball={b} />)}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--white)', minWidth: 38, textAlign: 'right' }}>
                    {total} runs
                  </span>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ── FALL OF WICKETS ──────────────────────────────────────────────────────── */}
      {fallOfWickets.length > 0 && (
        <Section label="FALL OF WICKETS" accent="var(--red)">
          <div style={{ padding: '10px 14px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {fallOfWickets.map((fw, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)',
                  borderRadius: 6, padding: '2px 7px',
                  fontSize: '0.7rem', fontWeight: 900, color: 'var(--red)',
                }}>
                  {fw.wkts}/{fw.runs}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                  {fw.name} · ov {fw.over}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── UMPIRE SECTION ────────────────────────────────────────────────────────── */}
      <UmpireBar isLocked={isLocked} onClaim={handleClaim} />

      <BottomNav />
    </div>
  )
}
