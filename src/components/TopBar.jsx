import { useNavigate } from 'react-router-dom'

/**
 * Universal top bar.
 * @param {{ title: string, onBack?: () => void }} props
 * - onBack: override the default navigate(-1) behaviour
 */
export default function TopBar({ title, onBack }) {
  const navigate = useNavigate()
  const handleBack = onBack ?? (() => navigate(-1))

  return (
    <div className="top-bar">
      <button className="top-bar-btn" onClick={handleBack}>← Back</button>
      <span className="top-bar-title">{title}</span>
      <button className="top-bar-btn top-bar-home" onClick={() => navigate('/')}>🏠</button>
    </div>
  )
}
