import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GripVertical, MoreVertical, Plus } from 'lucide-react'
import resultService from '@/services/resultService'
import participantService from '@/services/participantService'
import { ParticipantPositionType, School } from '@ubes/types'
import { SCHOOL_LABELS } from '@/lib/labels'
import type { ResultDTO, ResultCreateDTO } from '@ubes/types'
import type { ParticipantDTO } from '@ubes/types'

interface Props {
  competitionId: string
}

const SUB_TABS: { type: ParticipantPositionType; label: string }[] = [
  { type: ParticipantPositionType.INDIVIDUAL, label: 'Jugadores' },
  { type: ParticipantPositionType.SCHOOL, label: 'Escuela' },
  { type: ParticipantPositionType.SUPPORTER, label: 'Hinchada' },
]

const menuItemStyle: React.CSSProperties = {
  width: '100%', textAlign: 'left', padding: '7px 12px', fontSize: 12,
  fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer',
  fontFamily: 'var(--font-body)',
}

export default function ResultsTab({ competitionId }: Props) {
  const [localResults, setLocalResults] = useState<ResultDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<ParticipantPositionType>(ParticipantPositionType.INDIVIDUAL)
  const [dirtyTypes, setDirtyTypes] = useState<Set<ParticipantPositionType>>(new Set())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const draggingId = useRef<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)

  const [addName, setAddName] = useState('')
  const [addParticipantId, setAddParticipantId] = useState<string | null>(null)
  const [participantSuggestions, setParticipantSuggestions] = useState<ParticipantDTO[]>([])
  const [showParticipantDropdown, setShowParticipantDropdown] = useState(false)
  const [schoolSuggestions, setSchoolSuggestions] = useState<School[]>([])
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    resultService.getAll(competitionId)
      .then((data) => { setLocalResults(data); setDirtyTypes(new Set()) })
      .finally(() => setLoading(false))
  }, [competitionId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    setAddName(''); setAddParticipantId(null)
    setShowParticipantDropdown(false); setShowSchoolDropdown(false); setAddError(null)
  }, [activeType])

  useEffect(() => {
    if (activeType === ParticipantPositionType.INDIVIDUAL || !addName) {
      setSchoolSuggestions([]); setShowSchoolDropdown(false); return
    }
    const matches = (Object.values(School) as School[]).filter((v) =>
      SCHOOL_LABELS[v].toLowerCase().includes(addName.toLowerCase()))
    setSchoolSuggestions(matches)
    setShowSchoolDropdown(matches.length > 0 && addName.length > 0)
  }, [addName, activeType])

  useEffect(() => {
    if (activeType !== ParticipantPositionType.INDIVIDUAL || !addName || addParticipantId) {
      setParticipantSuggestions([]); setShowParticipantDropdown(false); return
    }
    const timer = setTimeout(() => {
      participantService.getAll(competitionId, { search: addName, size: 8 })
        .then((page) => { setParticipantSuggestions(page.content); setShowParticipantDropdown(page.content.length > 0) })
    }, 300)
    return () => clearTimeout(timer)
  }, [addName, addParticipantId, activeType, competitionId])

  const currentTypeResults = useMemo(
    () => localResults.filter((r) => r.positionType === activeType).sort((a, b) => a.positionNumber - b.positionNumber),
    [localResults, activeType],
  )

  const isDirty = dirtyTypes.has(activeType)

  function handleDragStart(id: string) { draggingId.current = id }
  function handleDragOver(e: React.DragEvent, id: string) { e.preventDefault(); if (draggingId.current !== id) setDragOverId(id) }
  function handleDragEnd() { draggingId.current = null; setDragOverId(null) }

  function handleDrop(targetId: string) {
    const fromId = draggingId.current
    draggingId.current = null; setDragOverId(null)
    if (!fromId || fromId === targetId) return
    setLocalResults((prev) => {
      const typeRows = prev.filter((r) => r.positionType === activeType).sort((a, b) => a.positionNumber - b.positionNumber)
      const fromIdx = typeRows.findIndex((r) => r.id === fromId)
      const toIdx = typeRows.findIndex((r) => r.id === targetId)
      if (fromIdx === -1 || toIdx === -1) return prev
      const reordered = [...typeRows]
      const [moved] = reordered.splice(fromIdx, 1)
      reordered.splice(toIdx, 0, moved)
      const renumbered = reordered.map((r, i) => ({ ...r, positionNumber: i + 1 }))
      return prev.map((r) => renumbered.find((x) => x.id === r.id) ?? r)
    })
    setDirtyTypes((prev) => new Set([...prev, activeType]))
  }

  async function handleSaveOrder() {
    setSaving(true); setSaveError(null)
    try {
      await resultService.reorder(competitionId, activeType, currentTypeResults.map((r) => ({ id: r.id, positionNumber: r.positionNumber })))
      setDirtyTypes((prev) => { const next = new Set(prev); next.delete(activeType); return next })
    } catch { setSaveError('No se pudo guardar el orden.') } finally { setSaving(false) }
  }

  function startEdit(result: ResultDTO) {
    setEditingId(result.id); setEditingName(result.name); setOpenMenuId(null)
    setTimeout(() => editInputRef.current?.select(), 30)
  }

  async function commitEdit() {
    if (!editingId || !editingName.trim()) { setEditingId(null); return }
    setEditSaving(true)
    try {
      const updated = await resultService.update(competitionId, editingId, { name: editingName.trim() })
      setLocalResults((list) => list.map((r) => (r.id === editingId ? updated : r)))
      setEditingId(null)
    } catch { } finally { setEditSaving(false) }
  }

  async function handleDelete(id: string) {
    try { await resultService.delete(competitionId, id); setLocalResults((list) => list.filter((r) => r.id !== id)) }
    finally { setConfirmDeleteId(null); setOpenMenuId(null) }
  }

  async function handleAdd() {
    if (!addName.trim()) return
    setAdding(true); setAddError(null)
    try {
      const dto: ResultCreateDTO = { positionType: activeType, name: addName.trim(), participantId: addParticipantId ?? undefined }
      const created = await resultService.add(competitionId, dto)
      setLocalResults((prev) => [...prev, created])
      setAddName(''); setAddParticipantId(null)
      setShowParticipantDropdown(false); setShowSchoolDropdown(false)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setAddError(msg ?? 'Error al agregar el resultado.')
    } finally { setAdding(false) }
  }

  function selectParticipant(p: ParticipantDTO) { setAddName(`${p.firstName} ${p.lastName}`); setAddParticipantId(p.id); setShowParticipantDropdown(false) }
  function selectSchool(school: School) { setAddName(SCHOOL_LABELS[school]); setShowSchoolDropdown(false) }

  const showSchoolColumn = activeType === ParticipantPositionType.INDIVIDUAL

  return (
    <div>
      <div className="panel-toolbar" style={{ marginBottom: 12 }}>
        <div className="sub-tabs" style={{ marginBottom: 0 }}>
          {SUB_TABS.map(({ type, label }) => (
            <button key={type} className={`sub-tab-btn${activeType === type ? ' active' : ''}`} onClick={() => setActiveType(type)}>
              {label}
            </button>
          ))}
        </div>
        <div className="panel-toolbar-right">
          {saveError && <span style={{ fontSize: 11, color: 'var(--red-strong)' }}>{saveError}</span>}
          <button className="btn btn-primary" onClick={handleSaveOrder} disabled={!isDirty || saving}>
            {saving ? 'Guardando...' : 'Guardar orden'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><p className="empty-state-text">Cargando...</p></div>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 28 }} />
                <th style={{ width: 36 }}>#</th>
                <th>Nombre</th>
                {showSchoolColumn && <th>Escuela</th>}
                <th style={{ width: 36 }} />
              </tr>
            </thead>
            <tbody>
              {currentTypeResults.length === 0 && (
                <tr><td colSpan={showSchoolColumn ? 5 : 4} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted-light)', fontSize: 13 }}>Sin resultados aún.</td></tr>
              )}
              {currentTypeResults.map((result) => (
                <tr key={result.id} draggable
                  onDragStart={() => handleDragStart(result.id)}
                  onDragOver={(e) => handleDragOver(e, result.id)}
                  onDrop={() => handleDrop(result.id)}
                  onDragEnd={handleDragEnd}
                  style={dragOverId === result.id ? { background: '#EFF6FF', borderTop: '2px solid #3B82F6' } : {}}
                >
                  <td style={{ paddingLeft: 8, cursor: 'grab', color: 'var(--muted-light)' }}>
                    <GripVertical size={14} />
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted-light)', fontWeight: 700 }}>
                    {result.positionNumber}
                  </td>
                  <td>
                    {editingId === result.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input ref={editInputRef} className="form-input" type="text" value={editingName}
                          style={{ padding: '4px 8px', fontSize: 13 }} autoFocus
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null) }}
                          onBlur={commitEdit} disabled={editSaving} />
                        {editSaving && <span style={{ fontSize: 11, color: 'var(--muted-light)' }}>Guardando…</span>}
                      </div>
                    ) : (
                      <span style={{ fontWeight: 600 }}>{result.name}</span>
                    )}
                  </td>
                  {showSchoolColumn && (
                    <td>{result.participant ? SCHOOL_LABELS[result.participant.school] : '—'}</td>
                  )}
                  <td style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                    <button className="action-btn" onClick={() => setOpenMenuId((id) => id === result.id ? null : result.id)}>
                      <MoreVertical size={13} />
                    </button>
                    {openMenuId === result.id && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => { setOpenMenuId(null); setConfirmDeleteId(null) }} />
                        <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 20, minWidth: 120, padding: '4px 0' }}>
                          {confirmDeleteId === result.id ? (
                            <div style={{ padding: '8px 12px' }}>
                              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>¿Eliminar?</p>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => handleDelete(result.id)} className="btn btn-danger" style={{ fontSize: 11, padding: '3px 10px' }}>Sí</button>
                                <button onClick={() => setConfirmDeleteId(null)} className="btn btn-ghost" style={{ fontSize: 11 }}>No</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button style={{ ...menuItemStyle, color: 'var(--ink)' }} onClick={() => startEdit(result)}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}>Editar</button>
                              <button style={{ ...menuItemStyle, color: 'var(--red-strong)' }} onClick={() => setConfirmDeleteId(result.id)}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}>Eliminar</button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add row */}
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', padding: '10px 0', marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select className="form-select" style={{ width: 'auto', flexShrink: 0 }}
                value={activeType} onChange={(e) => setActiveType(e.target.value as ParticipantPositionType)}>
                {SUB_TABS.map(({ type, label }) => <option key={type} value={type}>{label}</option>)}
              </select>

              <div style={{ position: 'relative', flex: 1 }}>
                <input className="form-input" type="text" value={addName}
                  onChange={(e) => { setAddName(e.target.value); if (addParticipantId) setAddParticipantId(null) }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } if (e.key === 'Escape') { setShowParticipantDropdown(false); setShowSchoolDropdown(false) } }}
                  placeholder={activeType === ParticipantPositionType.INDIVIDUAL ? 'Buscar participante...' : 'Nombre del resultado...'} />

                {showParticipantDropdown && participantSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', marginTop: 2, background: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 20, maxHeight: 200, overflowY: 'auto' }}>
                    {participantSuggestions.map((p) => (
                      <button key={p.id} type="button" onMouseDown={(e) => { e.preventDefault(); selectParticipant(p) }}
                        style={{ ...menuItemStyle, display: 'flex', justifyContent: 'space-between', color: 'var(--ink)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}>
                        <span style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</span>
                        <span style={{ color: 'var(--muted-light)', fontSize: 11 }}>{SCHOOL_LABELS[p.school]}</span>
                      </button>
                    ))}
                  </div>
                )}

                {showSchoolDropdown && schoolSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', marginTop: 2, background: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 20, maxHeight: 200, overflowY: 'auto' }}>
                    {schoolSuggestions.map((school) => (
                      <button key={school} type="button" onMouseDown={(e) => { e.preventDefault(); selectSchool(school) }}
                        style={{ ...menuItemStyle, color: 'var(--ink)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}>
                        {SCHOOL_LABELS[school]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="btn btn-primary" style={{ flexShrink: 0 }} onClick={handleAdd} disabled={adding || !addName.trim()}>
                <Plus size={13} /> {adding ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
            {addError && <p className="form-error" style={{ marginTop: 6 }}>{addError}</p>}
          </div>
        </>
      )}
    </div>
  )
}
