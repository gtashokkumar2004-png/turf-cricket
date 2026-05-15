import {
  getTodayMatches, getTopScorers, getTopWicketTakers,
  getManOfTheMatch, getManOfTheSeries,
} from '../utils/dashboardCalc.js'

const MEDAL       = ['🥇', '🥈', '🥉']
const PODIUM_BORDER = ['#f59e0b', '#94a3b8', '#b45309'] // gold / silver / bronze
// Visual left→right order: 2nd place | 1st place | 3rd place
const VISUAL_ORDER = [1, 0, 2]

function trunc(name, max = 12) {
  return name.length > max ? name.slice(0, max) + '…' : name
}

function PodiumCard({ rank, player, bigStat, subStat }) {
  return (
    <div style={{
      flex: 1,
      background: 'var(--green-mid)',
      borderRadius: 10,
      padding: '12px 8px',
      textAlign: 'center',
      minHeight: rank === 0 ? 115 : 100,
      borderTop: `3px solid ${PODIUM_BORDER[rank]}`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 3,
    }}>
      <div style={{ fontSize: '1.2rem', lineHeight: 1 }}>{MEDAL[rank]}</div>
      <div style={{
        fontSize: 13, fontWeight: 700, color: 'var(--white)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        maxWidth: '100%', padding: '0 4px',
      }} title={player.name}>
        {trunc(player.name)}
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--green-accent)', lineHeight: 1.1 }}>
        {bigStat}
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, lineHeight: 1.5, padding: '0 2px' }}>
        {subStat}
      </div>
    </div>
  )
}

function Podium({ data, bigKey, subBuilder }) {
  if (!data.length) return null
  const slots = VISUAL_ORDER.map(rank => ({ rank, player: data[rank] })).filter(s => s.player)
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
      {slots.map(({ rank, player }) => (
        <PodiumCard
          key={player.name}
          rank={rank}
          player={player}
          bigStat={player[bigKey]}
          subStat={subBuilder(player)}
        />
      ))}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 13, letterSpacing: 2, color: 'var(--muted)',
      textTransform: 'uppercase', marginBottom: 10, fontWeight: 700,
    }}>
      {children}
    </div>
  )
}

export default function TodayDashboard({ history }) {
  const todayMatches = getTodayMatches(history)
  const topScorers   = getTopScorers(todayMatches)
  const topWickets   = getTopWicketTakers(todayMatches)
  const motmList     = getManOfTheMatch(todayMatches)
  const mots         = getManOfTheSeries(todayMatches)
  const showMots     = todayMatches.length >= 2 && mots

  if (todayMatches.length === 0) {
    return (
      <div style={{
        padding: '20px 16px 24px', textAlign: 'center',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <div style={{ fontSize: '2rem' }}>🏏</div>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--white)' }}>No matches today yet</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Complete a match to see today's stats</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 16px 24px' }}>
      {showMots && (
        <style>{`@keyframes goldPulse{0%,100%{border-color:#f59e0b}50%{border-color:#fbbf24}}`}</style>
      )}

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--white)' }}>📅 Today's Stats</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 3 }}>
          {todayMatches.length} match{todayMatches.length !== 1 ? 'es' : ''} played today
        </div>
      </div>

      {/* Top Scorers */}
      {topScorers.length > 0 && (
        <>
          <SectionLabel>🏏 Top Scorers</SectionLabel>
          <Podium
            data={topScorers}
            bigKey="runs"
            subBuilder={p => `Balls: ${p.balls} · SR: ${p.sr} · 4s: ${p.fours} · 6s: ${p.sixes}`}
          />
          <Divider />
        </>
      )}

      {/* Top Wicket Takers */}
      {topWickets.length > 0 && (
        <>
          <SectionLabel>🎳 Top Wicket Takers</SectionLabel>
          <Podium
            data={topWickets}
            bigKey="wickets"
            subBuilder={p => `Runs: ${p.runs} · Eco: ${p.economy} · Ov: ${p.overs}`}
          />
          <Divider />
        </>
      )}

      {/* Man of the Match */}
      {motmList.length > 0 && (
        <>
          <SectionLabel>⭐ Man of the Match</SectionLabel>
          <div style={{
            display: 'flex', gap: 10, overflowX: 'auto',
            paddingBottom: 6, scrollbarWidth: 'none',
          }}>
            {motmList.map((motm, i) => (
              <div key={i} style={{
                minWidth: 160, flexShrink: 0, borderRadius: 10,
                background: 'var(--green-mid)', padding: 14,
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Watermark */}
                <div style={{
                  position: 'absolute', right: -4, top: -8,
                  fontSize: '4.5rem', opacity: 0.06, lineHeight: 1,
                  pointerEvents: 'none', userSelect: 'none',
                }}>⭐</div>

                <div style={{
                  fontSize: '0.6rem', fontWeight: 900, color: 'var(--muted)',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  Match {motm.matchIndex + 1}
                </div>
                <div style={{
                  fontSize: '0.68rem', color: 'var(--muted)', marginTop: 2,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {motm.teams}
                </div>
                <div style={{
                  fontSize: '1rem', fontWeight: 800, color: '#f59e0b', marginTop: 6,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }} title={motm.name}>
                  {motm.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 3 }}>
                  {motm.reason}
                </div>
              </div>
            ))}
          </div>
          {showMots && <Divider />}
        </>
      )}

      {/* Man of the Day */}
      {showMots && (
        <>
          <SectionLabel>🏆 Man of the Day</SectionLabel>
          <div style={{
            background: 'linear-gradient(135deg, #064e3b, #065f46)',
            border: '2px solid #f59e0b',
            borderRadius: 12, padding: '16px 14px',
            display: 'flex', alignItems: 'center', gap: 14,
            animation: 'goldPulse 2s ease-in-out infinite',
          }}>
            <div style={{ fontSize: '3rem', lineHeight: 1, flexShrink: 0 }}>🏆</div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: '0.58rem', fontWeight: 900, color: '#f59e0b',
                textTransform: 'uppercase', letterSpacing: '0.15em',
              }}>
                Man of the Day
              </div>
              <div style={{
                fontSize: '1.15rem', fontWeight: 900, color: 'var(--white)', marginTop: 3,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {mots.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
                {mots.reason}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
