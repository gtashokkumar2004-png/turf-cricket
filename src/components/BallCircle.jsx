import { ballLabel, ballColor } from '../utils/cricketCalc.js'

/**
 * Coloured circle representing a single ball delivery.
 * Pass ball=null for an "empty" (dashed) upcoming-ball placeholder.
 */
export default function BallCircle({ ball, size = 32, onClick, onLongPress }) {
  if (!ball) {
    return <div className="ball-circle empty" style={{ width: size, height: size }} />
  }

  const color = ballColor(ball)
  const label = ballLabel(ball)

  let timer = null
  function handlePointerDown() {
    if (!onLongPress) return
    timer = setTimeout(() => { onLongPress(); timer = null }, 600)
  }
  function handlePointerUp() {
    if (timer) { clearTimeout(timer); timer = null }
  }

  return (
    <div
      className={`ball-circle ${color}`}
      style={{ width: size, height: size, cursor: onClick || onLongPress ? 'pointer' : 'default' }}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      title={`${label}${ball.batsman ? ` — ${ball.batsman}` : ''}`}
    >
      {label}
    </div>
  )
}
