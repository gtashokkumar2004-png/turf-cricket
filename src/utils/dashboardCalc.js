import { getBatsmanStats, getBowlerStats, getBatsmenList, getBowlersList } from './cricketCalc.js'

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export function getTodayMatches(history) {
  const today = todayISO()
  return (history || []).filter(m => m.date === today && m.status === 'complete')
}

export function getTopScorers(todayMatches, topN = 3) {
  const map = {}

  for (const match of todayMatches) {
    for (const inn of match.innings) {
      if (!inn?.balls?.length) continue
      for (const name of getBatsmenList(inn.balls)) {
        const s = getBatsmanStats(inn.balls, name)
        if (!map[name]) map[name] = { runs: 0, balls: 0, fours: 0, sixes: 0, matchIds: new Set() }
        map[name].runs  += s.runs
        map[name].balls += s.ballsFaced
        map[name].fours += s.fours
        map[name].sixes += s.sixes
        map[name].matchIds.add(match.id)
      }
    }
  }

  return Object.entries(map)
    .filter(([, v]) => v.runs > 0)
    .map(([name, v]) => ({
      name,
      runs:    v.runs,
      balls:   v.balls,
      fours:   v.fours,
      sixes:   v.sixes,
      sr:      v.balls > 0 ? ((v.runs / v.balls) * 100).toFixed(0) : '0',
      matches: v.matchIds.size,
    }))
    .sort((a, b) => b.runs - a.runs || parseFloat(b.sr) - parseFloat(a.sr))
    .slice(0, topN)
}

export function getTopWicketTakers(todayMatches, topN = 3) {
  const map = {}

  for (const match of todayMatches) {
    for (const inn of match.innings) {
      if (!inn?.balls?.length) continue
      for (const name of getBowlersList(inn.balls)) {
        const s = getBowlerStats(inn.balls, name)
        if (!map[name]) map[name] = { wickets: 0, runs: 0, legalBalls: 0, matchIds: new Set() }
        map[name].wickets    += s.wickets
        map[name].runs       += s.runs
        map[name].legalBalls += s.legalBalls
        map[name].matchIds.add(match.id)
      }
    }
  }

  return Object.entries(map)
    .filter(([, v]) => v.wickets > 0)
    .map(([name, v]) => {
      const o   = Math.floor(v.legalBalls / 6)
      const rem = v.legalBalls % 6
      const eco = v.legalBalls > 0 ? ((v.runs / v.legalBalls) * 6).toFixed(1) : '0.0'
      return {
        name,
        wickets: v.wickets,
        runs:    v.runs,
        overs:   `${o}.${rem}`,
        economy: eco,
        matches: v.matchIds.size,
      }
    })
    .sort((a, b) => b.wickets - a.wickets || parseFloat(a.economy) - parseFloat(b.economy))
    .slice(0, topN)
}

// Build per-player batting + bowling totals for a single match
function buildMatchPlayerMap(match) {
  const map = {}

  const ensure = name => {
    if (!map[name]) map[name] = {
      bat:  { runs: 0, balls: 0, fours: 0, sixes: 0 },
      bowl: { wickets: 0, runs: 0, legalBalls: 0 },
    }
  }

  for (const inn of match.innings) {
    if (!inn?.balls?.length) continue
    for (const name of getBatsmenList(inn.balls)) {
      ensure(name)
      const s = getBatsmanStats(inn.balls, name)
      map[name].bat.runs  += s.runs
      map[name].bat.balls += s.ballsFaced
      map[name].bat.fours += s.fours
      map[name].bat.sixes += s.sixes
    }
    for (const name of getBowlersList(inn.balls)) {
      ensure(name)
      const s = getBowlerStats(inn.balls, name)
      map[name].bowl.wickets    += s.wickets
      map[name].bowl.runs       += s.runs
      map[name].bowl.legalBalls += s.legalBalls
    }
  }

  return map
}

function computeScore(bat, bowl) {
  let sc = bat.runs * 1.0 + bat.fours * 1 + bat.sixes * 2 + bowl.wickets * 25
  if (bowl.legalBalls >= 6) {
    sc -= ((bowl.runs / bowl.legalBalls) * 6) * 2
  }
  return sc
}

function buildReason(bat, bowl) {
  const parts = []
  if (bat.runs > 0) parts.push(`${bat.runs} runs`)
  if (bowl.wickets > 0) {
    const wktStr = `${bowl.wickets} wkt${bowl.wickets !== 1 ? 's' : ''}`
    if (bowl.legalBalls >= 6) {
      const eco = ((bowl.runs / bowl.legalBalls) * 6).toFixed(1)
      parts.push(`${wktStr} (Eco: ${eco})`)
    } else {
      parts.push(wktStr)
    }
  }
  if (parts.length === 0) parts.push(`${bat.runs} runs`)
  return parts.join(' & ')
}

export function getManOfTheMatch(todayMatches) {
  return todayMatches.map((match, matchIndex) => {
    const map = buildMatchPlayerMap(match)
    const entries = Object.entries(map)
    if (!entries.length) return null

    let bestName = null, bestSc = -Infinity
    for (const [name, { bat, bowl }] of entries) {
      const sc = computeScore(bat, bowl)
      if (sc > bestSc) { bestSc = sc; bestName = name }
    }
    if (!bestName) return null

    const { bat, bowl } = map[bestName]
    return {
      matchIndex,
      name:   bestName,
      reason: buildReason(bat, bowl),
      teams:  `${match.innings[0]?.battingTeam || 'Team 1'} vs ${match.innings[1]?.battingTeam || 'Team 2'}`,
    }
  }).filter(Boolean)
}

export function getManOfTheSeries(todayMatches) {
  if (todayMatches.length < 2) return null

  const global = {}

  for (const match of todayMatches) {
    const map = buildMatchPlayerMap(match)
    for (const [name, { bat, bowl }] of Object.entries(map)) {
      if (!global[name]) global[name] = {
        bat:  { runs: 0, balls: 0, fours: 0, sixes: 0 },
        bowl: { wickets: 0, runs: 0, legalBalls: 0 },
        matchCount: 0,
      }
      global[name].bat.runs        += bat.runs
      global[name].bat.balls       += bat.balls
      global[name].bat.fours       += bat.fours
      global[name].bat.sixes       += bat.sixes
      global[name].bowl.wickets    += bowl.wickets
      global[name].bowl.runs       += bowl.runs
      global[name].bowl.legalBalls += bowl.legalBalls
      global[name].matchCount++
    }
  }

  let bestName = null, bestSc = -Infinity
  for (const [name, { bat, bowl }] of Object.entries(global)) {
    const sc = computeScore(bat, bowl)
    if (sc > bestSc) { bestSc = sc; bestName = name }
  }
  if (!bestName) return null

  const { bat, bowl, matchCount } = global[bestName]
  const parts = []
  if (bat.runs > 0)     parts.push(`${bat.runs} runs`)
  if (bowl.wickets > 0) parts.push(`${bowl.wickets} wkts`)
  parts.push(`across ${matchCount} match${matchCount !== 1 ? 'es' : ''}`)

  return { name: bestName, reason: parts.join(', ') }
}
