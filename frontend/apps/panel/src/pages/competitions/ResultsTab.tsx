import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GripVertical, MoreVertical, Plus } from 'lucide-react'
import resultService from '@/services/resultService'
import participantService from '@/services/participantService'
import { ParticipantPositionType, School } from '@ubes/types'
import { SCHOOL_LABEL } from '@/lib/labels'
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

export default function ResultsTab({ competitionId }: Props) {
  const [localResults, setLocalResults] = useState<ResultDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<ParticipantPositionType>(
    ParticipantPositionType.INDIVIDUAL,
  )
  const [dirtyTypes, setDirtyTypes] = useState<Set<ParticipantPositionType>>(new Set())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Drag-to-reorder
  const draggingId = useRef<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  // Row action menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)

  // Add row
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
    resultService
      .getAll(competitionId)
      .then((data) => {
        setLocalResults(data)
        setDirtyTypes(new Set())
      })
      .finally(() => setLoading(false))
  }, [competitionId])

  useEffect(() => {
    load()
  }, [load])

  // Reset add row when switching type
  useEffect(() => {
    setAddName('')
    setAddParticipantId(null)
    setShowParticipantDropdown(false)
    setShowSchoolDropdown(false)
    setAddError(null)
  }, [activeType])

  // School autocomplete
  useEffect(() => {
    if (activeType === ParticipantPositionType.INDIVIDUAL || !addName) {
      setSchoolSuggestions([])
      setShowSchoolDropdown(false)
      return
    }
    const matches = (Object.values(School) as School[]).filter((v) =>
      SCHOOL_LABEL[v].toLowerCase().includes(addName.toLowerCase()),
    )
    setSchoolSuggestions(matches)
    setShowSchoolDropdown(matches.length > 0 && addName.length > 0)
  }, [addName, activeType])

  // Participant autocomplete (debounced)
  useEffect(() => {
    if (activeType !== ParticipantPositionType.INDIVIDUAL || !addName || addParticipantId) {
      setParticipantSuggestions([])
      setShowParticipantDropdown(false)
      return
    }
    const timer = setTimeout(() => {
      participantService
        .getAll(competitionId, { search: addName, size: 8 })
        .then((page) => {
          setParticipantSuggestions(page.content)
          setShowParticipantDropdown(page.content.length > 0)
        })
    }, 300)
    return () => clearTimeout(timer)
  }, [addName, addParticipantId, activeType, competitionId])

  const currentTypeResults = useMemo(
    () =>
      localResults
        .filter((r) => r.positionType === activeType)
        .sort((a, b) => a.positionNumber - b.positionNumber),
    [localResults, activeType],
  )

  const isDirty = dirtyTypes.has(activeType)

  // ── Drag-to-reorder ────────────────────────────────────────────────────────

  function handleDragStart(id: string) {
    draggingId.current = id
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    if (draggingId.current !== id) setDragOverId(id)
  }

  function handleDrop(targetId: string) {
    const fromId = draggingId.current
    draggingId.current = null
    setDragOverId(null)
    if (!fromId || fromId === targetId) return

    setLocalResults((prev) => {
      const typeRows = prev
        .filter((r) => r.positionType === activeType)
        .sort((a, b) => a.positionNumber - b.positionNumber)

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

  function handleDragEnd() {
    draggingId.current = null
    setDragOverId(null)
  }

  // ── Save reorder ───────────────────────────────────────────────────────────

  async function handleSaveOrder() {
    setSaving(true)
    setSaveError(null)
    try {
      const entries = currentTypeResults.map((r) => ({
        id: r.id,
        positionNumber: r.positionNumber,
      }))
      await resultService.reorder(competitionId, activeType, entries)
      setDirtyTypes((prev) => {
        const next = new Set(prev)
        next.delete(activeType)
        return next
      })
    } catch {
      setSaveError('No se pudo guardar el orden. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  // ── Inline edit ────────────────────────────────────────────────────────────

  function startEdit(result: ResultDTO) {
    setEditingId(result.id)
    setEditingName(result.name)
    setOpenMenuId(null)
    setTimeout(() => editInputRef.current?.select(), 30)
  }

  async function commitEdit() {
    if (!editingId || !editingName.trim()) {
      setEditingId(null)
      return
    }
    setEditSaving(true)
    try {
      const updated = await resultService.update(competitionId, editingId, {
        name: editingName.trim(),
      })
      setLocalResults((list) => list.map((r) => (r.id === editingId ? updated : r)))
      setEditingId(null)
    } catch {
      // keep editing open on error
    } finally {
      setEditSaving(false)
    }
  }

  function cancelEdit() {
    setEditingId(null)
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    try {
      await resultService.delete(competitionId, id)
      setLocalResults((list) => list.filter((r) => r.id !== id))
    } finally {
      setConfirmDeleteId(null)
      setOpenMenuId(null)
    }
  }

  // ── Add result ─────────────────────────────────────────────────────────────

  async function handleAdd() {
    if (!addName.trim()) return
    setAdding(true)
    setAddError(null)
    try {
      const dto: ResultCreateDTO = {
        positionType: activeType,
        name: addName.trim(),
        participantId: addParticipantId ?? undefined,
      }
      const created = await resultService.add(competitionId, dto)
      setLocalResults((prev) => [...prev, created])
      setAddName('')
      setAddParticipantId(null)
      setShowParticipantDropdown(false)
      setShowSchoolDropdown(false)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setAddError(msg ?? 'Error al agregar el resultado.')
    } finally {
      setAdding(false)
    }
  }

  function selectParticipant(p: ParticipantDTO) {
    setAddName(`${p.firstName} ${p.lastName}`)
    setAddParticipantId(p.id)
    setShowParticipantDropdown(false)
  }

  function selectSchool(school: School) {
    setAddName(SCHOOL_LABEL[school])
    setShowSchoolDropdown(false)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const showSchoolColumn = activeType === ParticipantPositionType.INDIVIDUAL

  return (
    <div>
      {/* Sub-tab bar + Save button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {SUB_TABS.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeType === type
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {saveError && <span className="text-xs text-red-500">{saveError}</span>}
          <button
            onClick={handleSaveOrder}
            disabled={!isDirty || saving}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar orden'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Cargando...</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="w-8" />
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500 w-12">#</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Nombre</th>
                  {showSchoolColumn && (
                    <th className="text-left px-3 py-2.5 font-medium text-gray-500">Escuela</th>
                  )}
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentTypeResults.length === 0 && (
                  <tr>
                    <td
                      colSpan={showSchoolColumn ? 5 : 4}
                      className="text-center py-10 text-gray-400 text-sm"
                    >
                      Sin resultados aún.
                    </td>
                  </tr>
                )}
                {currentTypeResults.map((result) => (
                  <tr
                    key={result.id}
                    draggable
                    onDragStart={() => handleDragStart(result.id)}
                    onDragOver={(e) => handleDragOver(e, result.id)}
                    onDrop={() => handleDrop(result.id)}
                    onDragEnd={handleDragEnd}
                    className={`transition-colors ${
                      dragOverId === result.id
                        ? 'bg-blue-50 border-t-2 border-t-blue-400'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Drag handle */}
                    <td className="pl-2 pr-0 py-2.5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500">
                      <GripVertical size={14} />
                    </td>

                    {/* Position number */}
                    <td className="px-3 py-2.5 text-gray-400 tabular-nums font-medium">
                      {result.positionNumber}
                    </td>

                    {/* Name (inline editable) */}
                    <td className="px-3 py-2.5 text-gray-900">
                      {editingId === result.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEdit()
                              if (e.key === 'Escape') cancelEdit()
                            }}
                            onBlur={commitEdit}
                            disabled={editSaving}
                            className="border border-blue-400 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0 flex-1"
                            autoFocus
                          />
                          {editSaving && (
                            <span className="text-xs text-gray-400 shrink-0">Guardando…</span>
                          )}
                        </div>
                      ) : (
                        <span className="font-medium">{result.name}</span>
                      )}
                    </td>

                    {/* School column (INDIVIDUAL only) */}
                    {showSchoolColumn && (
                      <td className="px-3 py-2.5 text-gray-500">
                        {result.participant ? SCHOOL_LABEL[result.participant.school] : '—'}
                      </td>
                    )}

                    {/* Action menu */}
                    <td
                      className="px-2 py-2.5 relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          setOpenMenuId((id) => (id === result.id ? null : result.id))
                        }
                        className="p-1 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {openMenuId === result.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => { setOpenMenuId(null); setConfirmDeleteId(null) }}
                          />
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[120px] py-1">
                            {confirmDeleteId === result.id ? (
                              <div className="px-3 py-2">
                                <p className="text-xs text-gray-600 mb-2">¿Eliminar?</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleDelete(result.id)}
                                    className="text-xs text-white bg-red-600 hover:bg-red-700 px-2 py-0.5 rounded"
                                  >
                                    Sí
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="text-xs text-gray-500 hover:text-gray-700"
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(result)}
                                  className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(result.id)}
                                  className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                                >
                                  Eliminar
                                </button>
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
            <div className="border-t border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                {/* Type selector */}
                <select
                  value={activeType}
                  onChange={(e) => setActiveType(e.target.value as ParticipantPositionType)}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shrink-0"
                >
                  {SUB_TABS.map(({ type, label }) => (
                    <option key={type} value={type}>
                      {label}
                    </option>
                  ))}
                </select>

                {/* Name input with autocomplete */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={addName}
                    onChange={(e) => {
                      setAddName(e.target.value)
                      // Clear participant selection if user edits after selecting one
                      if (addParticipantId) setAddParticipantId(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAdd()
                      }
                      if (e.key === 'Escape') {
                        setShowParticipantDropdown(false)
                        setShowSchoolDropdown(false)
                      }
                    }}
                    placeholder={
                      activeType === ParticipantPositionType.INDIVIDUAL
                        ? 'Buscar participante...'
                        : 'Nombre del resultado...'
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {/* Participant dropdown */}
                  {showParticipantDropdown && participantSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                      {participantSuggestions.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            selectParticipant(p)
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
                        >
                          <span className="font-medium text-gray-800">
                            {p.firstName} {p.lastName}
                          </span>
                          <span className="text-xs text-gray-400">{SCHOOL_LABEL[p.school]}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* School dropdown */}
                  {showSchoolDropdown && schoolSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                      {schoolSuggestions.map((school) => (
                        <button
                          key={school}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            selectSchool(school)
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {SCHOOL_LABEL[school]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAdd}
                  disabled={adding || !addName.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Plus size={13} />
                  {adding ? 'Agregando...' : 'Agregar'}
                </button>
              </div>

              {addError && <p className="text-xs text-red-500 mt-1.5">{addError}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
