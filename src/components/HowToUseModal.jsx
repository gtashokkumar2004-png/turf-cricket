const SECTIONS = [
  {
    title: '1. Start a New Match',
    icon: '⚙️',
    steps: [
      'Tap New Match on the Home screen.',
      'Enter both team names and the number of overs.',
      'Tap Next to add players for each team (or pick from your saved Player Pool).',
    ],
  },
  {
    title: '2. Toss',
    icon: '🪙',
    steps: [
      'Tap Flip Coin and wait for the result.',
      'Select who won the toss, then choose Bat or Bowl.',
      'Tapping Start Match automatically makes you the Umpire for this session.',
    ],
  },
  {
    title: '3. Opening Players',
    icon: '🏏',
    steps: [
      'Select the two opening batsmen — striker is highlighted in yellow.',
      'Then select the opening bowler from the bowling team.',
    ],
  },
  {
    title: '4. Recording a Ball',
    icon: '✅',
    steps: [
      'Tap a run value (0–6). Use 4🔥 or 6⚡ for boundaries.',
      'Optionally tap an extra: Wd (Wide), NB (No Ball), Bye, or LB (Leg Bye).',
      'Tap 🔴 Wicket if a wicket fell and choose the dismissal type.',
      'Tap ✓ Record Ball to save the delivery.',
      'Long-press the last ball circle to undo the most recent ball.',
    ],
  },
  {
    title: '5. Between Overs & Wickets',
    icon: '🔄',
    steps: [
      'End of over: you\'ll be prompted to select a new bowler.',
      'Wicket: you\'ll be prompted to select the incoming batsman.',
      'After a wicket that also ends the over, select the batsman first then the bowler.',
    ],
  },
  {
    title: '6. Scorecard',
    icon: '📊',
    steps: [
      'Tap the 📊 floating button (bottom-right) anytime for the full scorecard.',
      'Switch between innings using the tabs at the top.',
    ],
  },
  {
    title: '7. Bowlers Panel',
    icon: '🎳',
    steps: [
      'A scrollable chip strip below the over display shows all bowlers this innings.',
      'Each chip shows their figures — e.g. Rajan  2.0–18–1.',
      'Tap any chip to quickly switch the current bowler back to that player.',
    ],
  },
  {
    title: '8. Umpire Mode',
    icon: '🟢',
    steps: [
      'Only one person can score at a time — the active Umpire.',
      'The person who starts the match (toss) is automatically the Umpire.',
      'A green UMPIRE MODE banner with an ✕ End Session button appears at the top of the scoring screen.',
      'To hand over: tap ✕ End Session — this releases the lock and switches you to the live viewer.',
      'On the Score tab (live view), the next person taps 🎙️ Claim Umpire at the bottom to take over scoring.',
      'No PIN required — it works on trust. Viewers see the live IPL-style broadcast; the Umpire sees the scoring controls.',
    ],
    tip: 'No dedicated umpire needed — whoever is NOT batting holds the phone and scores. Pass it on when you go in to bat!',
  },
  {
    title: '9. Live View (Viewers)',
    icon: '📺',
    steps: [
      'Anyone not scoring taps the 🏏 Score tab to watch the live broadcast.',
      'Shows: big live score, CRR & RRR, This Over (IPL-style coloured boxes), batting and bowling stats, recent overs with bowler names, and fall of wickets.',
      'All viewers update in real time when the umpire records each ball.',
    ],
  },
  {
    title: '10. Match Complete',
    icon: '🏆',
    steps: [
      'When all overs are bowled or all wickets fall, the result is shown automatically.',
      'Tap View Full Scorecard to review both innings in detail.',
      'The completed match is saved to History — accessible from the 📋 tab anytime.',
    ],
  },
]

export default function HowToUseModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="modal-title">🏏 How to Use</div>

        {SECTIONS.map((section) => (
          <div key={section.title} style={{ marginBottom: 18 }}>
            <div style={{
              fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--green-accent)',
              marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>{section.icon}</span>
              <span>{section.title}</span>
            </div>

            {section.steps.map((step, i) => (
              <div key={i} className="howto-step">
                <div className="howto-num">{i + 1}</div>
                <div style={{ paddingTop: 3, fontSize: '0.88rem', lineHeight: 1.45 }}>{step}</div>
              </div>
            ))}

            {section.tip && (
              <div style={{
                marginTop: 8,
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 8, padding: '8px 12px',
                fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.45,
              }}>
                💡 {section.tip}
              </div>
            )}
          </div>
        ))}

        <button className="btn btn-primary btn-full mt-16" onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  )
}
