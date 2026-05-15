import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MatchProvider } from './hooks/useMatch.js'
import { ToastProvider } from './hooks/useToast.js'
import Home from './pages/Home.jsx'
import Setup from './pages/Setup.jsx'
import PickTeams from './pages/PickTeams.jsx'
import Toss from './pages/Toss.jsx'
import LiveView from './pages/LiveView.jsx'
import Score from './pages/Score.jsx'
import Scorecard from './pages/Scorecard.jsx'
import Players from './pages/Players.jsx'
import History from './pages/History.jsx'
import Summary from './pages/Summary.jsx'

export default function App() {
  return (
    <HashRouter>
      <MatchProvider>
        <ToastProvider>
          <div className="app-container">
            <Routes>
              <Route path="/"              element={<Home />} />
              <Route path="/setup"         element={<Setup />} />
              <Route path="/pick-teams"    element={<PickTeams />} />
              <Route path="/toss"          element={<Toss />} />
              <Route path="/score"         element={<LiveView />} />
              <Route path="/umpire"        element={<Score />} />
              <Route path="/scorecard"     element={<Scorecard />} />
              <Route path="/players"       element={<Players />} />
              <Route path="/history"       element={<History />} />
              <Route path="/summary/:matchId" element={<Summary />} />
              <Route path="*"              element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </ToastProvider>
      </MatchProvider>
    </HashRouter>
  )
}
