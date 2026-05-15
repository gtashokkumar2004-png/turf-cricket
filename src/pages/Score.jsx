import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useMatch } from '../hooks/useMatch.js'
import { useToast } from '../hooks/useToast.js'
import { useUmpireLock } from '../hooks/useUmpireLock.js'
import { calcInningsStats, getCurrentOverBalls, getBatsmanStats, getBowlersList, getBowlerStats } from '../utils/cricketCalc.js'
import BallCircle from '../components/BallCircle.jsx'
import PlayerSelectSheet from '../components/PlayerSelectSheet.jsx'
import WicketSheet from '../components/WicketSheet.jsx'
import TopBar from '../components/TopBar.jsx'

const RUN_VALS = [0, 1, 2, 3, 4, 5, 6]
const EXTRAS = ['Wide', 'No Ball', 'Bye', 'Leg Bye']

export default function Score() {
  const navigate = useNavigate()
  const addToast = useToast()
  const {
    match, recordBall, setCurrentBowler, replaceBatsman, undoLastBall,
  } = useMatch()
  const { isLocked, release } = useUmpireLock()

  // Ball builder
  const [selectedRuns, setSelectedRuns] = useState(0)
  const [selectedExtra, setSelectedExtra] = useState(null)
  const [isWicket, setIsWicket] = useState(false)
  const [wicketType, setWicketType] = useState('')

  // UI sheets
  const [showWicketSheet, setShowWicketSheet] = useState(false)
  const [showBatsmanSheet, setShowBatsmanSheet] = useState(false)
  const [batsmanSlot, setBatsmanSlot] = useState(0)
  const [showBowlerSheet, setShowBowlerSheet] = useState(false)
  const [needBowlerAfterBatsman, setNeedBowlerAfterBatsman] = useState(false)
  const [showInningsBreak, setShowInningsBreak] = useState(false)
  const [syncOk, setSyncOk] = useState(true)

  // Prevent setup-sheet useEffect from firing during innings break
  const inningsBreakActiveRef = useRef(false)
  const sheetsUrl = localStorage.getItem('turf_sheets_url')

  // Guards
  if (!match) return <Navigate to="/" replace />
  if (!isLocked) return <Navigate to="/score" replace />

  const inn = match.innings[match.currentInnings]
  const stats = calcInningsStats(inn.balls)
  const overBalls = getCurrentOverBalls(inn.balls)
  const maxBalls = match.overs * 6
  const legalInOver = overBalls.filter(b => b.extras !== 'Wide' && b.extras !== 'No Ball').length

  const inn1Stats = match.currentInnings === 1 ? calcInningsStats(match.innings[0].balls) : null
  const target = inn1Stats ? inn1Stats.runs + 1 : null
  const needed = target ? target - stats.runs : null
  const remainingBalls = maxBalls - stats.legalBalls

  const striker = match.currentBatsmen[match.strikerIndex] || ''
  const bowler = match.currentBowler || ''

  // Use per-match player lists set during PickTeams
  const battingPlayers = match.players?.[inn.battingTeam] || []
  const bowlingPlayers = match.players?.[inn.bowlingTeam] || []

  // Show player-select sheets when innings starts or resumes
  useEffect(() => {
    if (inningsBreakActiveRef.current) return
    const b0 = match.currentBatsmen[0]
    const b1 = match.currentBatsmen[1]
    const bw = match.currentBowler
    if (!b0) { setBatsmanSlot(0); setShowBatsmanSheet(true) }
    else if (!b1) { setBatsmanSlot(1); setShowBatsmanSheet(true) }
    else if (!bw) setShowBowlerSheet(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.currentInnings])

  // Navigate to summary when match completes (no saveToHistory here — Summary handles it)
  useEffect(() => {
    if (match.status === 'complete') {
      navigate(`/summary/${match.id}`, { state: { match } })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.status])

  const handleUndo = useCallback(() => {
    undoLastBall()
    addToast('↩ Last ball undone')
  }, [undoLastBall, addToast])

  function handleRecord() {
    if (!striker || !bowler) { addToast('Set batsman and bowler first!'); return }

    const isLegal = selectedExtra !== 'Wide' && selectedExtra !== 'No Ball'
    const newLegalBalls = stats.legalBalls + (isLegal ? 1 : 0)
    const newWickets = stats.wickets + (isWicket ? 1 : 0)
    const willEndOver = isLegal && newLegalBalls % 6 === 0 && newLegalBalls > 0
    const willEndInnings = newLegalBalls >= maxBalls || newWickets >= 10

    recordBall({ runs: selectedRuns, extras: selectedExtra, wicket: isWicket, wicketType, fielder: '' })

    if (sheetsUrl) {
      fetch(sheetsUrl, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.id, inningsNo: match.currentInnings + 1,
          over: stats.overs, ball: stats.ballsInOver + 1,
          batsman: striker, bowler, runs: selectedRuns,
          extras: selectedExtra, wicket: isWicket, wicketType,
        }),
      }).then(() => setSyncOk(true)).catch(() => setSyncOk(false))
    }

    setSelectedRuns(0); setSelectedExtra(null); setIsWicket(false); setWicketType('')

    if (willEndInnings) {
      if (match.currentInnings === 0) {
        inningsBreakActiveRef.current = true
        setShowInningsBreak(true)
      }
      return
    }

    if (isWicket && willEndOver) {
      setNeedBowlerAfterBatsman(true)
      setBatsmanSlot(match.strikerIndex)
      setShowBatsmanSheet(true)
      addToast('🔄 Over! Select new batsman then bowler')
    } else if (isWicket) {
      setBatsmanSlot(match.strikerIndex)
      setShowBatsmanSheet(true)
    } else if (willEndOver) {
      addToast('🔄 Over! Select new bowler')
      setShowBowlerSheet(true)
    }
  }

  function handleBatsmanSelect(name) {
    replaceBatsman(batsmanSlot, name)
    setShowBatsmanSheet(false)
    // Read the OTHER slot's current value from match (pre-update, but that's the other slot so it's fine)
    const otherSlot = 1 - batsmanSlot
    const otherName = match.currentBatsmen[otherSlot]
    if (!otherName) {
      setBatsmanSlot(otherSlot)
      setTimeout(() => setShowBatsmanSheet(true), 80)
    } else if (!bowler) {
      setTimeout(() => setShowBowlerSheet(true), 80)
    } else if (needBowlerAfterBatsman) {
      setNeedBowlerAfterBatsman(false)
      setTimeout(() => setShowBowlerSheet(true), 80)
    }
  }

  function handleBowlerSelect(name) {
    setCurrentBowler(name)
    setShowBowlerSheet(false)
    if (!match.currentBatsmen[0]) {
      setBatsmanSlot(0)
      setTimeout(() => setShowBatsmanSheet(true), 80)
    }
  }

  function handleStartInnings2() {
    inningsBreakActiveRef.current = false
    setShowInningsBreak(false)
    setBatsmanSlot(0)
    setTimeout(() => setShowBatsmanSheet(true), 120)
  }

  const inn0Stats = calcInningsStats(match.innings[0].balls)
  const canRecord = !!striker && !!bowler

  return (
    <div className="page" style={{ paddingBottom: 80 }}>
      <TopBar title="Scoring" />

      {/* ── Umpire session banner ─── */}
      <div style={{
        background: 'rgba(16,185,129,0.1)',
        borderBottom: '1px solid rgba(16,185,129,0.2)',
        padding: '6px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: '1rem' }}>🎙️</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--green-accent)', letterSpacing: '0.05em' }}>
            UMPIRE MODE
          </span>
        </div>
        <button
          onClick={() => { release(); navigate('/score') }}
          style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.35)',
            borderRadius: 6, padding: '4px 14px',
            color: 'var(--red)', fontSize: '0.78rem', fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          ✕ End Session
        </button>
      </div>

      {/* ── Score header ─── */}
      <div className="score-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="score-big">{stats.runs}/{stats.wickets}</div>
            <div className="score-meta">
              ({stats.overs}.{stats.ballsInOver} / {match.overs} ov) &nbsp;·&nbsp; RR: {stats.rr}
            </div>
            {target !== null && needed !== null && (
              <div className="score-target">
                {needed > 0
                  ? `Need ${needed} off ${remainingBalls} ball${remainingBalls !== 1 ? 's' : ''}`
                  : '🎉 Target reached!'}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right', minWidth: 80 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 800 }}>{inn.battingTeam}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{match.currentInnings === 0 ? '1st Inn' : '2nd Inn'}</div>
            {sheetsUrl && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', marginTop: 6 }}>
                <div className={`sync-dot ${syncOk ? 'synced' : 'error'}`} />
                <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{syncOk ? 'synced' : 'offline'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Batsmen ─── */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 16px 0' }}>
        {[0, 1].map(slot => {
          const name = match.currentBatsmen[slot]
          const isStriker = match.strikerIndex === slot
          const bStats = name ? getBatsmanStats(inn.balls, name) : null
          return (
            <button
              key={slot}
              onClick={() => { setBatsmanSlot(slot); setShowBatsmanSheet(true) }}
              style={{
                flex: 1, background: 'var(--green-mid)', cursor: 'pointer',
                border: `2px solid ${isStriker ? 'var(--yellow)' : 'transparent'}`,
                borderRadius: 12, padding: '10px 12px', textAlign: 'left',
                boxShadow: isStriker ? '0 0 14px rgba(245,158,11,0.3)' : undefined,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: isStriker ? 'var(--yellow)' : 'var(--white)' }}>
                {name ? `${name}${isStriker ? ' *' : ''}` : <span style={{ color: 'var(--muted)' }}>{isStriker ? 'Set striker' : 'Set batsman'}</span>}
              </div>
              {name && bStats && (
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 3 }}>
                  {bStats.runs} ({bStats.ballsFaced}b)
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Bowler ─── */}
      <div style={{ padding: '8px 16px 0' }}>
        <button
          onClick={() => setShowBowlerSheet(true)}
          style={{
            width: '100%', background: 'var(--green-mid)', border: '2px solid transparent',
            borderRadius: 12, padding: '10px 14px', textAlign: 'left', cursor: 'pointer',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>
            🎳 {bowler || <span style={{ color: 'var(--muted)' }}>👆 Tap bowler to select</span>}
          </div>
          {bowler && (() => {
            const bs = calcInningsStats(inn.balls.filter(b => b.bowler === bowler))
            return <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 3 }}>{bs.overs}.{bs.ballsInOver}-{bs.runs}-{bs.wickets}</div>
          })()}
        </button>
      </div>

      {/* ── Current over ─── */}
      <div style={{ margin: '8px 16px 0', background: 'var(--green-mid)', borderRadius: 12, padding: '10px 14px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: 8 }}>
          Over {stats.overs + 1}
          {overBalls.length > 0 && <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 8 }}>long-press last ball to undo</span>}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {overBalls.map((b, i) => (
            <BallCircle key={b.id} ball={b} onLongPress={i === overBalls.length - 1 ? handleUndo : undefined} />
          ))}
          {Array.from({ length: Math.max(0, 6 - legalInOver) }).map((_, i) => (
            <BallCircle key={`em${i}`} ball={null} />
          ))}
        </div>
      </div>

      {/* ── Bowlers this innings ─── */}
      {(() => {
        const bowlersList = getBowlersList(inn.balls)
        return (
          <div style={{ padding: '8px 0 0' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', padding: '0 16px', marginBottom: 6 }}>
              Bowlers
            </div>
            {bowlersList.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', padding: '0 16px 4px' }}>No bowlers yet this innings</p>
            ) : (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 16px 4px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                {bowlersList.map(name => {
                  const bs = getBowlerStats(inn.balls, name)
                  const isCurrent = name === bowler
                  return (
                    <button
                      key={name}
                      onClick={() => setCurrentBowler(name)}
                      style={{
                        flexShrink: 0, background: 'var(--green-mid)',
                        border: `1.5px solid ${isCurrent ? 'var(--green-accent)' : 'rgba(255,255,255,0.12)'}`,
                        borderRadius: 20, padding: '6px 14px', cursor: 'pointer',
                        boxShadow: isCurrent ? '0 0 10px rgba(16,185,129,0.4)' : 'none',
                        color: isCurrent ? 'var(--green-accent)' : 'var(--white)',
                        fontFamily: 'Nunito,sans-serif', fontSize: '0.8rem', fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {name} &nbsp; {bs.oversStr}–{bs.runs}–{bs.wickets}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })()}

      {/* ── Run buttons ─── */}
      <div style={{ padding: '10px 16px 0' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: 8 }}>Runs</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {RUN_VALS.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRuns(r)}
              style={{
                padding: '14px 0', border: `2px solid ${selectedRuns === r ? (r === 4 ? 'var(--blue)' : r === 6 ? 'var(--purple)' : 'var(--green-accent)') : 'transparent'}`,
                borderRadius: 10, minHeight: 52, cursor: 'pointer',
                background: selectedRuns === r
                  ? (r === 4 ? 'rgba(59,130,246,0.35)' : r === 6 ? 'rgba(139,92,246,0.35)' : 'rgba(16,185,129,0.3)')
                  : 'rgba(255,255,255,0.08)',
                fontFamily: 'Nunito,sans-serif', fontSize: '1.25rem', fontWeight: 900,
                color: r === 4 ? 'var(--blue)' : r === 6 ? 'var(--purple)' : 'var(--white)',
                transition: 'all 0.12s',
              }}
            >
              {r === 4 ? '4🔥' : r === 6 ? '6⚡' : r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Extras ─── */}
      <div style={{ padding: '10px 16px 0' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: 8 }}>Extras (optional)</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {EXTRAS.map(ex => (
            <button
              key={ex}
              className={`pill pill-yellow ${selectedExtra === ex ? 'active' : ''}`}
              onClick={() => setSelectedExtra(p => p === ex ? null : ex)}
            >
              {ex === 'Wide' ? 'Wd' : ex === 'No Ball' ? 'NB' : ex === 'Leg Bye' ? 'LB' : 'Bye'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Wicket ─── */}
      <div style={{ padding: '10px 16px 0' }}>
        <button
          onClick={() => isWicket ? (setIsWicket(false), setWicketType('')) : setShowWicketSheet(true)}
          style={{
            width: '100%', padding: '13px 16px', borderRadius: 8, cursor: 'pointer', minHeight: 48,
            border: `1.5px solid ${isWicket ? 'var(--red)' : 'rgba(239,68,68,0.4)'}`,
            background: isWicket ? 'rgba(239,68,68,0.25)' : 'transparent',
            fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: '1rem', color: 'var(--red)',
          }}
        >
          {isWicket ? `🔴 Wicket: ${wicketType} — tap to remove` : '🔴 Wicket'}
        </button>
      </div>

      {/* ── Record ─── */}
      <div style={{ padding: '12px 16px 4px' }}>
        <button
          className="btn btn-primary btn-full"
          style={{ fontSize: '1.1rem', padding: '17px', opacity: canRecord ? 1 : 0.5 }}
          onClick={handleRecord}
          disabled={!canRecord}
        >
          ✓ Record Ball
        </button>
        {!canRecord && (
          <p className="hint" style={{ marginTop: 6 }}>
            {!striker ? '👆 Tap batsman name to change' : '👆 Tap bowler to select'}
          </p>
        )}
      </div>

      {/* ── Floating scorecard ─── */}
      <button className="fab" onClick={() => navigate('/scorecard')} title="Live Scorecard">📊</button>

      {/* ── Sheets ─── */}
      {showWicketSheet && (
        <WicketSheet onSelect={t => { setWicketType(t); setIsWicket(true); setShowWicketSheet(false) }} onClose={() => setShowWicketSheet(false)} />
      )}
      {showBatsmanSheet && (
        <PlayerSelectSheet
          title={match.strikerIndex === batsmanSlot ? 'Select Striker' : 'Select Non-Striker'}
          players={battingPlayers}
          exclude={match.currentBatsmen.filter((_, i) => i !== batsmanSlot)}
          onSelect={handleBatsmanSelect}
          onClose={() => setShowBatsmanSheet(false)}
        />
      )}
      {showBowlerSheet && (
        <PlayerSelectSheet
          title="Select Bowler"
          players={bowlingPlayers}
          exclude={[]}
          onSelect={handleBowlerSelect}
          onClose={() => setShowBowlerSheet(false)}
        />
      )}

      {/* ── Innings break overlay ─── */}
      {showInningsBreak && (
        <div className="innings-break">
          <div style={{ fontSize: '3rem' }}>🏏</div>
          <h2>1st Innings Over!</h2>
          <div className="card" style={{ width: '100%', textAlign: 'center', padding: '16px' }}>
            <div style={{ fontWeight: 800, color: 'var(--muted)', fontSize: '0.85rem' }}>{match.innings[0].battingTeam} scored</div>
            <div className="score-big" style={{ fontSize: '2.4rem', marginTop: 4 }}>
              {inn0Stats.runs}/{inn0Stats.wickets}
            </div>
            <div className="text-muted text-sm" style={{ marginTop: 4 }}>
              in {inn0Stats.overs}.{inn0Stats.ballsInOver} overs &nbsp;·&nbsp; RR: {inn0Stats.rr}
            </div>
          </div>
          <div className="score-target" style={{ fontSize: '1.4rem', fontWeight: 900 }}>
            {match.innings[1].battingTeam} need {inn0Stats.runs + 1} to win
          </div>
          <button className="btn btn-primary btn-full" style={{ marginTop: 8 }} onClick={handleStartInnings2}>
            Start 2nd Innings →
          </button>
        </div>
      )}
    </div>
  )
}
