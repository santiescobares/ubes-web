import { useState, useEffect, useCallback } from 'react'
import { Plus, Save, Loader2, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import type { CompetitionDTO, ParticipantPositionType, ResultDTO, School } from '@ubes/types'
import ResultService from '@/services/resultService'
import RowActionMenu from './RowActionMenu'
import ConfirmActionModal from '@/components/ConfirmActionModal'
import { SCHOOL_LABELS } from '@/lib/schoolLabels'
import ParticipantSearchInput from './ParticipantSearchInput'

interface Props {
  competition: CompetitionDTO
  isFinished: boolean
}

interface ResultEntry {
  localId: string
  id?: string
  positionType: SubTab
  positionNumber: number
  name: string
  participantId?: string | null
  participantLabel?: string
  schoolLabel?: string
  state: 'pristine' | 'dirty' | 'new'
  editing: boolean
}

type SubTab = ParticipantPositionType

const SUB_TABS: { value: SubTab; label: string }[] = [
  { value: 'SCHOOL',     label: 'Escuela'   },
  { value: 'INDIVIDUAL', label: 'Jugadores' },
  { value: 'SUPPORTER',  label: 'Hinchada'  },
]

function dtoToEntry(dto: ResultDTO): ResultEntry {
  return {
    localId: crypto.randomUUID(),
    id: dto.id,
    positionType: dto.positionType,
    positionNumber: dto.positionNumber,
    name: dto.name,
    participantId: dto.participant?.id ?? null,
    participantLabel: dto.participant ? `${dto.participant.firstName} ${dto.participant.lastName}` : undefined,
    schoolLabel: dto.participant?.school ?? dto.school ?? undefined,
    state: 'pristine',
    editing: false,
  }
}

function reorderPositions(entries: ResultEntry[]): ResultEntry[] {
  return entries.map((e, i) => ({ ...e, positionNumber: i + 1 }))
}

export default function ResultsTab({ competition, isFinished }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('SCHOOL')
  const [entries, setEntries] = useState<ResultEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<ResultEntry | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await ResultService.list(competition.id, subTab)
      setEntries(data.map(dtoToEntry).sort((a, b) => a.positionNumber - b.positionNumber))
    } catch {
      toast.error('Error al cargar los resultados')
    } finally {
      setLoading(false)
    }
  }, [competition.id, subTab])

  useEffect(() => { load() }, [load])

  function updateEntry(localId: string, patch: Partial<ResultEntry>) {
    setEntries(prev => prev.map(e =>
      e.localId === localId
        ? { ...e, ...patch, state: e.state === 'new' ? 'new' : 'dirty' }
        : e
    ))
  }

  function addEntry() {
    const maxPos = entries.reduce((m, e) => Math.max(m, e.positionNumber), 0)
    setEntries(prev => [...prev, {
      localId: crypto.randomUUID(),
      positionType: subTab,
      positionNumber: maxPos + 1,
      name: '',
      state: 'new',
      editing: true,
    }])
  }

  async function handleSave() {
    const dirty = entries.filter(e => e.state !== 'pristine')
    if (dirty.length === 0) return
    const invalid = dirty.find(e => !e.name.trim())
    if (invalid) { toast.error('Todos los resultados deben tener un nombre'); return }

    if (subTab === 'SCHOOL' || subTab === 'SUPPORTER') {
      const names = entries.map(e => e.name.trim()).filter(Boolean)
      if (names.length !== new Set(names).size) {
        toast.error('No puede haber dos resultados con la misma escuela')
        return
      }
    }

    if (subTab === 'INDIVIDUAL') {
      const linkedIds = entries.filter(e => e.participantId).map(e => e.participantId!)
      if (linkedIds.length !== new Set(linkedIds).size) {
        toast.error('No puede haber dos resultados con el mismo participante')
        return
      }
      const freeNames = entries.filter(e => !e.participantId).map(e => e.name.trim()).filter(Boolean)
      if (freeNames.length !== new Set(freeNames).size) {
        toast.error('No puede haber dos resultados con el mismo nombre')
        return
      }
    }

    setSaving(true)
    try {
      await ResultService.bulkUpsert(competition.id, {
        items: dirty.map(e => ({
          id: e.id,
          positionType: subTab,
          positionNumber: e.positionNumber,
          name: e.name.trim(),
          participantId: e.participantId ?? undefined,
          school: !e.participantId && e.schoolLabel ? e.schoolLabel as School : undefined,
        })),
      })
      toast.success('Resultados guardados')
      await load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Error al guardar los resultados')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(entry: ResultEntry) {
    if (!entry.id) {
      setEntries(prev => reorderPositions(prev.filter(e => e.localId !== entry.localId)))
      return
    }
    try {
      await ResultService.remove(competition.id, entry.id)
      await load()
    } catch {
      toast.error('Error al eliminar el resultado')
    }
  }

  const hasDirty = entries.some(e => e.state !== 'pristine')
  const colCount = subTab === 'INDIVIDUAL' ? 4 : 3

  if (!isFinished) {
    return (
      <div style={{ padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Trophy size={28} style={{ color: 'var(--muted-light)' }} />
        <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
          Los resultados estarán disponibles una vez que la competencia finalice.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Sub-tabs */}
      <div className="sub-tabs">
        {SUB_TABS.map(tab => (
          <button
            key={tab.value}
            className={`sub-tab-btn${subTab === tab.value ? ' active' : ''}`}
            onClick={() => setSubTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="panel-toolbar">
        <span style={{ fontWeight: 700, fontSize: 13 }}>Resultados de Competencia</span>
        <div className="panel-toolbar-right">
          <button className="btn btn-secondary" onClick={addEntry} type="button">
            <Plus size={13} /> Agregar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!hasDirty || saving}
            type="button"
          >
            {saving ? <Loader2 size={13} className="spin-icon" /> : <Save size={13} />}
            Guardar
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Cargando...</p>
      ) : (
        <table className="data-table results-inline-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              {subTab === 'INDIVIDUAL' && <th>Escuela</th>}
              <th style={{ width: 36 }} />
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={colCount} style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px 0' }}>
                  Sin resultados cargados
                </td>
              </tr>
            )}
            {entries.map((entry, index) => (
              <tr key={entry.localId} className={entry.editing ? 'row-editing' : ''}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted-light)', width: 36 }}>
                  {index + 1}
                </td>
                <td>
                  {entry.editing && (entry.positionType === 'SCHOOL' || entry.positionType === 'SUPPORTER') ? (
                    <select
                      className="inline-input"
                      value={entry.name}
                      onChange={e => updateEntry(entry.localId, { name: e.target.value })}
                    >
                      <option value="">— Seleccionar escuela —</option>
                      {Object.entries(SCHOOL_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  ) : entry.editing && entry.positionType === 'INDIVIDUAL' ? (
                    <ParticipantSearchInput
                      competitionId={competition.id}
                      value={{ participantId: entry.participantId ?? null, label: entry.name }}
                      onChange={v => updateEntry(entry.localId, {
                        name: v.label,
                        participantId: v.participantId,
                        schoolLabel: v.schoolLabel,
                      })}
                      disabled={saving}
                    />
                  ) : entry.editing ? (
                    <input
                      className="inline-input"
                      value={entry.name}
                      onChange={e => updateEntry(entry.localId, { name: e.target.value })}
                      placeholder="Nombre del resultado"
                      autoFocus
                    />
                  ) : (
                    <span>
                      {(entry.positionType === 'SCHOOL' || entry.positionType === 'SUPPORTER')
                        ? (entry.name ? (SCHOOL_LABELS[entry.name] ?? entry.name) : <span style={{ color: 'var(--muted-light)' }}>—</span>)
                        : (entry.name || <span style={{ color: 'var(--muted-light)' }}>—</span>)
                      }
                    </span>
                  )}
                </td>
                {subTab === 'INDIVIDUAL' && (
                  <td>
                    {entry.editing ? (
                      <select
                        className="inline-input"
                        value={entry.schoolLabel ?? ''}
                        onChange={e => updateEntry(entry.localId, { schoolLabel: e.target.value || undefined })}
                        disabled={saving}
                      >
                        <option value="">— Escuela —</option>
                        {Object.entries(SCHOOL_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ color: entry.schoolLabel ? 'var(--ink)' : 'var(--muted-light)' }}>
                        {entry.schoolLabel ? (SCHOOL_LABELS[entry.schoolLabel] ?? entry.schoolLabel) : '—'}
                      </span>
                    )}
                  </td>
                )}
                <td>
                  <RowActionMenu
                    state={entry.state}
                    onEdit={() => updateEntry(entry.localId, { editing: !entry.editing })}
                    onDelete={() => entry.state === 'new' ? handleDelete(entry) : setConfirmDelete(entry)}
                    disabled={saving}
                  />
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={colCount}>
                <button
                  type="button"
                  className="add-row-btn"
                  onClick={addEntry}
                  disabled={saving}
                >
                  <Plus size={12} /> Agregar Entrada
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {confirmDelete && (
        <ConfirmActionModal
          title="Eliminar resultado"
          message={`¿Eliminás el resultado "${confirmDelete.name ? (SCHOOL_LABELS[confirmDelete.name] ?? confirmDelete.name) : `#${confirmDelete.positionNumber}`}"? Los demás se reordenarán automáticamente.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={() => handleDelete(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
