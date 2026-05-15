import { useState, useRef } from 'react'
import BottomNav from '../components/BottomNav.jsx'
import TopBar from '../components/TopBar.jsx'

const DEFAULT_POOL = [
  'Ashok', 'Karthik', 'Murugan', 'Selvam', 'Dinesh', 'Praveen', 'Arjun',
  'Venkat', 'Surya', 'Balu', 'Rajan', 'Senthil', 'Pradeep', 'Vijay',
  'Mani', 'Suresh', 'Gopal', 'Ramesh', 'Lokesh', 'Kumar',
]
const MAX_POOL = 20
const LONG_MS = 600

function loadPool() {
  try {
    const r = localStorage.getItem('turf_pool')
    const parsed = r ? JSON.parse(r) : null
    return Array.isArray(parsed) ? parsed : DEFAULT_POOL
  } catch { return DEFAULT_POOL }
}

function savePool(pool) {
  localStorage.setItem('turf_pool', JSON.stringify(pool))
}

export default function Players() {
  const [pool, setPool] = useState(loadPool)
  const [editIndex, setEditIndex] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [addMode, setAddMode] = useState(false)
  const [newName, setNewName] = useState('')

  function update(p) { setPool(p); savePool(p) }

  function startEdit(i) { setEditIndex(i); setEditValue(pool[i]) }

  function commitEdit() {
    if (!editValue.trim()) return
    const p = [...pool]; p[editIndex] = editValue.trim()
    update(p); setEditIndex(null)
  }

  function deletePlayer(i) {
    if (!window.confirm(`Remove "${pool[i]}" from pool?`)) return
    update(pool.filter((_, j) => j !== i))
    setEditIndex(null)
  }

  function addPlayer() {
    if (!newName.trim() || pool.length >= MAX_POOL) return
    update([...pool, newName.trim()])
    setNewName(''); setAddMode(false)
  }

  return (
    <div className="page">
      <TopBar title="👥 Players" />

      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div className="label" style={{ marginBottom: 0 }}>Player Pool ({pool.length}/{MAX_POOL})</div>
          {pool.length < MAX_POOL && !addMode && (
            <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem', minHeight: 36 }} onClick={() => setAddMode(true)}>
              + Add
            </button>
          )}
        </div>
        <p className="hint" style={{ padding: '0 0 8px', textAlign: 'left' }}>
          Tap name to edit &nbsp;·&nbsp; Long-press to delete
        </p>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {pool.map((name, i) => (
            <PlayerRow
              key={`${i}-${name}`}
              name={name}
              isEditing={editIndex === i}
              editValue={editValue}
              onEditChange={setEditValue}
              onStartEdit={() => startEdit(i)}
              onCommitEdit={commitEdit}
              onCancelEdit={() => setEditIndex(null)}
              onDelete={() => deletePlayer(i)}
              isLast={i === pool.length - 1 && !addMode}
            />
          ))}

          {addMode && (
            <div style={{ display: 'flex', gap: 8, padding: '10px 14px', borderTop: pool.length ? '1px solid rgba(255,255,255,0.07)' : undefined }}>
              <input
                className="input"
                style={{ flex: 1, padding: '8px 12px', minHeight: 40 }}
                placeholder="Player name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addPlayer(); if (e.key === 'Escape') { setAddMode(false); setNewName('') } }}
                maxLength={24}
                autoFocus
              />
              <button className="btn btn-primary" style={{ padding: '8px 14px', minHeight: 40, fontSize: '0.85rem' }} onClick={addPlayer}>Add</button>
              <button className="btn btn-ghost" style={{ padding: '8px 10px', minHeight: 40 }} onClick={() => { setAddMode(false); setNewName('') }}>✕</button>
            </div>
          )}

          {pool.length === 0 && !addMode && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
              No players yet. Tap + Add to get started.
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function PlayerRow({ name, isEditing, editValue, onEditChange, onStartEdit, onCommitEdit, onCancelEdit, onDelete, isLast }) {
  const timer = useRef(null)
  const fired = useRef(false)

  function down() {
    fired.current = false
    timer.current = setTimeout(() => { fired.current = true; onDelete() }, LONG_MS)
  }
  function up() { clearTimeout(timer.current) }
  function click() { if (!fired.current) onStartEdit() }

  if (isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: isLast ? undefined : '1px solid rgba(255,255,255,0.07)' }}>
        <input
          className="input"
          style={{ flex: 1, padding: '8px 12px', minHeight: 40 }}
          value={editValue}
          onChange={e => onEditChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onCommitEdit(); if (e.key === 'Escape') onCancelEdit() }}
          maxLength={24}
          autoFocus
        />
        <button className="btn btn-primary" style={{ padding: '8px 14px', minHeight: 40, fontSize: '0.85rem' }} onClick={onCommitEdit}>Save</button>
        <button className="btn btn-ghost" style={{ padding: '8px 10px', minHeight: 40 }} onClick={onCancelEdit}>✕</button>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', padding: '13px 14px',
        borderBottom: isLast ? undefined : '1px solid rgba(255,255,255,0.07)',
        cursor: 'pointer', userSelect: 'none',
      }}
      onClick={click}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
    >
      <span style={{ fontWeight: 600, flex: 1 }}>👤 {name}</span>
      <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>tap to edit</span>
    </div>
  )
}
