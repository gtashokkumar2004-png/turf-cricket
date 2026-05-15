import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { calcInningsStats } from '../utils/cricketCalc.js'

const ACTIVE_KEY = 'turf_active'
const HISTORY_KEY = 'turf_history'

function load(key, def) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : def }
  catch { return def }
}

/** Synchronous write so navigating pages always see current state */
function persist(key, value) {
  if (value == null) localStorage.removeItem(key)
  else localStorage.setItem(key, JSON.stringify(value))
}

const MatchContext = createContext(null)

export function MatchProvider({ children }) {
  const [match, setMatchRaw] = useState(() => load(ACTIVE_KEY, null))
  const [history, setHistory] = useState(() => load(HISTORY_KEY, []))

  // Keep localStorage in sync for history (match is written synchronously in every mutation)
  useEffect(() => { persist(HISTORY_KEY, history) }, [history])

  // Live-sync: when the umpire's tab writes to localStorage, every other open tab
  // (viewer's LiveView) picks up the change via the 'storage' event and re-renders.
  useEffect(() => {
    function onStorage(e) {
      if (e.key === ACTIVE_KEY) setMatchRaw(load(ACTIVE_KEY, null))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setMatch = useCallback((updater) => {
    setMatchRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(ACTIVE_KEY, next)   // synchronous so next route reads fresh state
      return next
    })
  }, [])

  function createMatch({ team1, team2, overs }) {
    const m = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      team1, team2, overs,
      tossWinner: '', battingFirst: '',
      status: 'toss',
      currentInnings: 0,
      innings: [
        { battingTeam: '', bowlingTeam: '', balls: [] },
        { battingTeam: '', bowlingTeam: '', balls: [] },
      ],
      currentBatsmen: ['', ''],
      strikerIndex: 0,
      currentBowler: '',
      players: {},       // populated by PickTeams: { [teamName]: string[] }
      winner: undefined,
      margin: undefined,
    }
    persist(ACTIVE_KEY, m)
    setMatchRaw(m)
    return m
  }

  function setMatchPlayers(players) {
    setMatch(prev => ({ ...prev, players }))
  }

  function setToss(tossWinner, battingFirst) {
    setMatch(prev => {
      const bowlingFirst = battingFirst === prev.team1 ? prev.team2 : prev.team1
      return {
        ...prev, tossWinner, battingFirst,
        status: 'innings1',
        innings: [
          { battingTeam: battingFirst, bowlingTeam: bowlingFirst, balls: [] },
          { battingTeam: bowlingFirst, bowlingTeam: battingFirst, balls: [] },
        ],
      }
    })
  }

  function setCurrentBatsmen(batsmen) {
    setMatch(prev => ({ ...prev, currentBatsmen: [...batsmen] }))
  }

  function setStriker(index) {
    setMatch(prev => ({ ...prev, strikerIndex: index }))
  }

  function setCurrentBowler(bowler) {
    setMatch(prev => ({ ...prev, currentBowler: bowler }))
  }

  function replaceBatsman(slotIndex, name) {
    setMatch(prev => {
      const b = [...prev.currentBatsmen]
      b[slotIndex] = name
      return { ...prev, currentBatsmen: b }
    })
  }

  function recordBall(ballData) {
    setMatch(prev => {
      if (!prev) return prev
      const inn = prev.innings[prev.currentInnings]
      const stats = calcInningsStats(inn.balls)
      const isLegal = ballData.extras !== 'Wide' && ballData.extras !== 'No Ball'

      const newBall = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        over: stats.overs,
        ball: isLegal ? stats.ballsInOver + 1 : 0,
        batsman: prev.currentBatsmen[prev.strikerIndex],
        bowler: prev.currentBowler,
        runs: ballData.runs ?? 0,
        extras: ballData.extras ?? null,
        wicket: ballData.wicket ?? false,
        wicketType: ballData.wicketType ?? '',
        fielder: ballData.fielder ?? '',
      }

      const newBalls = [...inn.balls, newBall]
      const newStats = calcInningsStats(newBalls)
      const maxBalls = prev.overs * 6
      const isOverEnd = isLegal && newStats.legalBalls % 6 === 0 && newStats.legalBalls > 0
      const isInningsEnd = newStats.legalBalls >= maxBalls || newStats.wickets >= 10

      let striker = prev.strikerIndex
      if (!newBall.wicket) {
        if (newBall.runs % 2 === 1) striker = 1 - striker
        if (isOverEnd && !isInningsEnd) striker = 1 - striker
      }

      let newStatus = prev.status
      if (isInningsEnd) newStatus = prev.currentInnings === 0 ? 'innings2' : 'complete'

      let winner = prev.winner
      let margin = prev.margin
      if (newStatus === 'complete') {
        const inn1 = calcInningsStats(prev.innings[0].balls)
        const inn2Runs = newStats.runs
        if (inn2Runs > inn1.runs) {
          const wktsLeft = 10 - newStats.wickets
          winner = prev.innings[1].battingTeam
          margin = `${wktsLeft} wicket${wktsLeft !== 1 ? 's' : ''}`
        } else if (inn2Runs === inn1.runs) {
          winner = 'Tie'; margin = 'Tied'
        } else {
          const diff = inn1.runs - inn2Runs
          winner = prev.innings[0].battingTeam
          margin = `${diff} run${diff !== 1 ? 's' : ''}`
        }
      }

      const newInnings = prev.innings.map((i2, i) =>
        i === prev.currentInnings ? { ...i2, balls: newBalls } : i2
      )

      return {
        ...prev,
        innings: newInnings,
        strikerIndex: striker,
        status: newStatus,
        winner, margin,
        currentInnings: isInningsEnd && prev.currentInnings === 0 ? 1 : prev.currentInnings,
        currentBatsmen: isInningsEnd ? ['', ''] : prev.currentBatsmen,
        currentBowler: isInningsEnd ? '' : prev.currentBowler,
      }
    })
  }

  function undoLastBall() {
    setMatch(prev => {
      if (!prev) return prev
      const inn = prev.innings[prev.currentInnings]
      if (!inn.balls.length) return prev
      const newInnings = prev.innings.map((i2, i) =>
        i === prev.currentInnings ? { ...i2, balls: i2.balls.slice(0, -1) } : i2
      )
      return { ...prev, innings: newInnings }
    })
  }

  function saveToHistory() {
    setMatchRaw(prev => {
      if (!prev) return null
      const completed = { ...prev, status: 'complete' }
      setHistory(h => {
        const next = [completed, ...h.filter(m => m.id !== prev.id)].slice(0, 50)
        persist(HISTORY_KEY, next)
        return next
      })
      persist(ACTIVE_KEY, null)
      return null
    })
  }

  function clearActive() {
    persist(ACTIVE_KEY, null)
    setMatchRaw(null)
  }

  function getMatchById(id) {
    return history.find(m => m.id === id) || null
  }

  const value = {
    match, history,
    createMatch, setMatchPlayers, setToss,
    setCurrentBatsmen, setStriker, setCurrentBowler, replaceBatsman,
    recordBall, undoLastBall,
    saveToHistory, clearActive, getMatchById,
  }

  return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>
}

export function useMatch() {
  return useContext(MatchContext)
}
