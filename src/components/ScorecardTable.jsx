import { getBatsmenList, getBowlersList, getBatsmanStats, getBowlerStats, calcInningsStats, getOversBreakdown } from '../utils/cricketCalc.js'
import BallCircle from './BallCircle.jsx'

/**
 * Full scorecard for a single innings: batting table, bowling table, over breakdown.
 */
export default function ScorecardTable({ innings, overs }) {
  if (!innings || !innings.balls.length) {
    return <p className="hint" style={{ padding: 24 }}>No balls recorded yet.</p>
  }

  const stats = calcInningsStats(innings.balls)
  const batsmen = getBatsmenList(innings.balls)
  const bowlers = getBowlersList(innings.balls)
  const oversBreakdown = getOversBreakdown(innings.balls, overs)

  return (
    <div style={{ padding: '0 0 16px' }}>
      {/* Summary row */}
      <div className="card" style={{ margin: '12px 16px', textAlign: 'center' }}>
        <div className="score-big" style={{ fontSize: '2rem' }}>
          {innings.battingTeam}: {stats.runs}/{stats.wickets}
        </div>
        <div className="text-muted text-sm mt-4">
          {stats.overs}.{stats.ballsInOver} ov &nbsp;·&nbsp; RR: {stats.rr}
        </div>
        <div className="text-xs text-muted mt-4">
          Extras: {stats.wides + stats.noBalls + stats.byes + stats.legByes}
          &nbsp;(W:{stats.wides} NB:{stats.noBalls} B:{stats.byes} LB:{stats.legByes})
        </div>
      </div>

      {/* Batting */}
      <div className="section">
        <div className="label">Batting</div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="sc-table">
            <thead>
              <tr>
                <th>Batter</th>
                <th style={{ textAlign: 'right' }}>R</th>
                <th style={{ textAlign: 'right' }}>B</th>
                <th style={{ textAlign: 'right' }}>4s</th>
                <th style={{ textAlign: 'right' }}>6s</th>
                <th style={{ textAlign: 'right' }}>SR</th>
              </tr>
            </thead>
            <tbody>
              {batsmen.map(name => {
                const s = getBatsmanStats(innings.balls, name)
                return (
                  <tr key={name}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{name}</div>
                      <div className={s.isOut ? 'out' : 'not-out'}>
                        {s.isOut ? `${s.howOut}${s.dismissedBy ? ` b ${s.dismissedBy}` : ''}` : 'not out'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{s.runs}</td>
                    <td style={{ textAlign: 'right', color: 'var(--muted)' }}>{s.ballsFaced}</td>
                    <td style={{ textAlign: 'right', color: 'var(--blue)' }}>{s.fours}</td>
                    <td style={{ textAlign: 'right', color: 'var(--purple)' }}>{s.sixes}</td>
                    <td style={{ textAlign: 'right', color: 'var(--muted)' }}>{s.sr}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bowling */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="label">Bowling</div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="sc-table">
            <thead>
              <tr>
                <th>Bowler</th>
                <th style={{ textAlign: 'right' }}>O</th>
                <th style={{ textAlign: 'right' }}>R</th>
                <th style={{ textAlign: 'right' }}>W</th>
                <th style={{ textAlign: 'right' }}>Eco</th>
                <th style={{ textAlign: 'right' }}>Wd</th>
                <th style={{ textAlign: 'right' }}>NB</th>
              </tr>
            </thead>
            <tbody>
              {bowlers.map(name => {
                const s = getBowlerStats(innings.balls, name)
                return (
                  <tr key={name}>
                    <td style={{ fontWeight: 700 }}>{name}</td>
                    <td style={{ textAlign: 'right', color: 'var(--muted)' }}>{s.oversStr}</td>
                    <td style={{ textAlign: 'right' }}>{s.runs}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: s.wickets > 0 ? 'var(--red)' : undefined }}>{s.wickets}</td>
                    <td style={{ textAlign: 'right', color: 'var(--muted)' }}>{s.eco}</td>
                    <td style={{ textAlign: 'right', color: 'var(--yellow)' }}>{s.wides}</td>
                    <td style={{ textAlign: 'right', color: 'var(--yellow)' }}>{s.noBalls}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Over-by-over */}
      {oversBreakdown.length > 0 && (
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="label">Over by Over</div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {oversBreakdown.map(({ overIndex, balls: ob, total }) => (
              <div key={overIndex} className="flex items-center gap-8">
                <span style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, width: 24 }}>
                  {overIndex + 1}
                </span>
                <div className="flex gap-6 wrap" style={{ flex: 1 }}>
                  {ob.map(b => <BallCircle key={b.id} ball={b} size={28} />)}
                </div>
                <span style={{ color: 'var(--green-accent)', fontWeight: 800, fontSize: '0.85rem', width: 28, textAlign: 'right' }}>
                  {total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
