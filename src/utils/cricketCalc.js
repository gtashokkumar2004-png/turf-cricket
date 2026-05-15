/**
 * Calculate full innings statistics from ball array.
 * @param {Object[]} balls
 * @returns {{ runs, wickets, legalBalls, wides, noBalls, byes, legByes, overs, ballsInOver, rr }}
 */
export function calcInningsStats(balls) {
  let runs = 0, wickets = 0, legalBalls = 0
  let wides = 0, noBalls = 0, byes = 0, legByes = 0

  for (const b of balls) {
    const isWide = b.extras === 'Wide'
    const isNB = b.extras === 'No Ball'
    const isBye = b.extras === 'Bye'
    const isLegBye = b.extras === 'Leg Bye'

    runs += b.runs
    if (isWide) { runs += 1; wides++ }
    if (isNB) { runs += 1; noBalls++ }
    if (isBye) byes += b.runs
    if (isLegBye) legByes += b.runs
    if (b.wicket) wickets++
    if (!isWide && !isNB) legalBalls++
  }

  const overs = Math.floor(legalBalls / 6)
  const ballsInOver = legalBalls % 6
  const rr = legalBalls > 0 ? ((runs / legalBalls) * 6).toFixed(1) : '0.0'

  return { runs, wickets, legalBalls, wides, noBalls, byes, legByes, overs, ballsInOver, rr }
}

/**
 * Get all balls (including extras) bowled in a specific over index.
 * @param {Object[]} balls
 * @param {number} overIndex
 * @returns {Object[]}
 */
export function getOverBalls(balls, overIndex) {
  return balls.filter(b => b.over === overIndex)
}

/**
 * Get all balls in the currently incomplete over (last over being bowled).
 * @param {Object[]} balls
 * @returns {Object[]}
 */
export function getCurrentOverBalls(balls) {
  const { overs } = calcInningsStats(balls)
  return balls.filter(b => b.over === overs)
}

/**
 * Short display label for a ball circle.
 * @param {Object} ball
 * @returns {string}
 */
export function ballLabel(ball) {
  if (ball.wicket) return 'W'
  if (ball.extras === 'Wide') return 'Wd'
  if (ball.extras === 'No Ball') return 'NB'
  if (ball.extras === 'Bye') return ball.runs ? `${ball.runs}b` : 'b'
  if (ball.extras === 'Leg Bye') return ball.runs ? `${ball.runs}lb` : 'lb'
  return ball.runs === 0 ? '•' : String(ball.runs)
}

/**
 * CSS colour key for a ball circle.
 * @param {Object} ball
 * @returns {'wicket'|'extra'|'four'|'six'|'runs'|'dot'}
 */
export function ballColor(ball) {
  if (ball.wicket) return 'wicket'
  if (ball.extras === 'Wide' || ball.extras === 'No Ball') return 'extra'
  if (ball.runs === 4) return 'four'
  if (ball.runs === 6) return 'six'
  if (ball.runs > 0) return 'runs'
  return 'dot'
}

/**
 * Batting statistics for a named player in an innings.
 * @param {Object[]} balls
 * @param {string} name
 * @returns {{ runs, ballsFaced, fours, sixes, sr, isOut, howOut, dismissedBy }}
 */
export function getBatsmanStats(balls, name) {
  let runs = 0, ballsFaced = 0, fours = 0, sixes = 0
  let isOut = false, howOut = '', dismissedBy = ''

  for (const b of balls) {
    if (b.batsman !== name) continue
    if (b.extras === 'Wide') continue
    ballsFaced++
    if (!b.extras || b.extras === 'No Ball') {
      runs += b.runs
      if (b.runs === 4) fours++
      if (b.runs === 6) sixes++
    }
    if (b.wicket) {
      isOut = true
      howOut = b.wicketType || 'out'
      dismissedBy = b.bowler
    }
  }

  const sr = ballsFaced > 0 ? ((runs / ballsFaced) * 100).toFixed(0) : '-'
  return { runs, ballsFaced, fours, sixes, sr, isOut, howOut, dismissedBy }
}

/**
 * Bowling statistics for a named player in an innings.
 * @param {Object[]} balls
 * @param {string} name
 * @returns {{ oversStr, runs, wickets, eco, wides, noBalls }}
 */
export function getBowlerStats(balls, name) {
  let runs = 0, wickets = 0, legalBalls = 0, wides = 0, noBalls = 0

  for (const b of balls) {
    if (b.bowler !== name) continue
    const isWide = b.extras === 'Wide'
    const isNB = b.extras === 'No Ball'
    const isBye = b.extras === 'Bye'
    const isLegBye = b.extras === 'Leg Bye'

    if (isWide) {
      runs += 1 + b.runs
      wides++
    } else if (isNB) {
      runs += 1 + b.runs
      noBalls++
      legalBalls++
    } else {
      if (!isBye && !isLegBye) runs += b.runs
      legalBalls++
    }
    if (b.wicket && b.wicketType !== 'Run Out') wickets++
  }

  const o = Math.floor(legalBalls / 6)
  const rem = legalBalls % 6
  const oversStr = `${o}.${rem}`
  const eco = legalBalls > 0 ? ((runs / legalBalls) * 6).toFixed(1) : '0.0'

  return { oversStr, runs, wickets, eco, wides, noBalls, legalBalls }
}

/**
 * Unique batsmen who batted in an innings, in order of first appearance.
 * @param {Object[]} balls
 * @returns {string[]}
 */
export function getBatsmenList(balls) {
  const seen = new Set()
  const list = []
  for (const b of balls) {
    if (b.batsman && !seen.has(b.batsman)) {
      seen.add(b.batsman)
      list.push(b.batsman)
    }
  }
  return list
}

/**
 * Unique bowlers who bowled in an innings, in order of first appearance.
 * @param {Object[]} balls
 * @returns {string[]}
 */
export function getBowlersList(balls) {
  const seen = new Set()
  const list = []
  for (const b of balls) {
    if (b.bowler && !seen.has(b.bowler)) {
      seen.add(b.bowler)
      list.push(b.bowler)
    }
  }
  return list
}

/**
 * Over-by-over summary: array of { overIndex, balls[], total }.
 * @param {Object[]} balls
 * @param {number} totalOvers
 * @returns {Array}
 */
export function getOversBreakdown(balls, totalOvers) {
  const result = []
  for (let i = 0; i < totalOvers; i++) {
    const overBalls = getOverBalls(balls, i)
    if (overBalls.length === 0) break
    const total = overBalls.reduce((sum, b) => {
      let r = b.runs
      if (b.extras === 'Wide' || b.extras === 'No Ball') r += 1
      return sum + r
    }, 0)
    result.push({ overIndex: i, balls: overBalls, total })
  }
  return result
}
