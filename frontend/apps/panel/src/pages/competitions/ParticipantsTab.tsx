import { useCallback, useEffect, useRef, useState } from 'react'
import { MoreVertical, Plus, Search, X } from 'lucide-react'
import participantService from '@/services/participantService'
import { SCHOOL_LABELS, PARTICIPANT_ROLE_LABELS } from '@/lib/labels'
import ParticipantViewModal from './ParticipantViewModal'
import ParticipantFormModal from './ParticipantFormModal'
import type { ParticipantDTO } from '@ubes/types'
import type { Page } from '@/lib/types'

interface Props {
  competitionId: string
  requiresShirtNumbers: boolean
  requiresMedicalCertificates: boolean
}

const PAGE_SIZE_OPTIONS = [10, 20, 50]

export default function ParticipantsTab({ competitionId, requiresShirtNumbers, requiresMedicalCertificates }: Props) {
  const [data, setData] = useState<Page<ParticipantDTO> | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const [searchVisible, setSearchVisible] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [viewingParticipant, setViewingParticipant] = useState<ParticipantDTO | null>(null)
  const [editingParticipant, setEditingParticipant] = useState<ParticipantDTO | null | undefined>(undefined)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setCurrentPage(0) }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const load = useCallback(() => {
    setLoading(true)
    participantService
      .getAll(competitionId, { page: currentPage, size: pageSize, search: search || undefined })
      .then(setData)
      .finally(() => setLoading(false))
  }, [competitionId, currentPage, pageSize, search])

  useEffect(() => { load() }, [load])

  function openCreate() { setEditingParticipant(null); setShowForm(true); setOpenMenuId(null) }
  function openEdit(p: ParticipantDTO) { setViewingParticipant(null); setEditingParticipant(p); setShowForm(true); setOpenMenuId(null) }
  function openView(p: ParticipantDTO) { setViewingParticipant(p); setOpenMenuId(null) }

  function handleSaved(p: ParticipantDTO) {
    setShowForm(false)
    setEditingParticipant(undefined)
    setData((prev) => {
      if (!prev) return prev
      const idx = prev.content.findIndex((x) => x.id === p.id)
      if (idx >= 0) {
        const updated = [...prev.content]
        updated[idx] = p
        return { ...prev, content: updated }
      }
      return prev
    })
    load()
  }

  function handleDeleted() { setShowForm(false); setEditingParticipant(undefined); load() }

  function toggleSearch() {
    setSearchVisible((v) => {
      if (v) { setSearchInput('') } else { setTimeout(() => searchRef.current?.focus(), 50) }
      return !v
    })
  }

  const participants = data?.content ?? []

  return (
    <div>
      <div className="panel-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {searchVisible ? (
            <div className="search-bar">
              <Search size={13} className="search-bar-icon" />
              <input ref={searchRef} className="search-bar-input" type="text" value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)} placeholder="Buscar participante..." />
              <button onClick={toggleSearch} style={{ position: 'absolute', right: 8, color: 'var(--muted-light)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                <X size={12} />
              </button>
            </div>
          ) : (
            <button className="action-btn" title="Buscar" onClick={toggleSearch}>
              <Search size={14} />
            </button>
          )}
        </div>
        <div className="panel-toolbar-right">
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={13} /> Agregar
          </button>
        </div>
      </div>

      {loading && participants.length === 0 ? (
        <div className="empty-state"><p className="empty-state-text">Cargando...</p></div>
      ) : participants.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-text">
            {search ? 'Sin resultados para esa búsqueda.' : 'Aún no hay participantes.'}
          </p>
          {!search && <button className="btn btn-primary" onClick={openCreate}><Plus size={13} /> Agregar primero</button>}
        </div>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>#</th>
                <th>Nombre completo</th>
                <th>Rol</th>
                <th>Escuela</th>
                <th style={{ width: 36 }} />
              </tr>
            </thead>
            <tbody>
              {participants.map((p, idx) => (
                <tr key={p.id} onClick={() => openView(p)}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted-light)' }}>
                    {currentPage * pageSize + idx + 1}
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</td>
                  <td>{PARTICIPANT_ROLE_LABELS[p.role]}</td>
                  <td>{SCHOOL_LABELS[p.school]}</td>
                  <td style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                    <button className="action-btn" onClick={() => setOpenMenuId((id) => id === p.id ? null : p.id)}>
                      <MoreVertical size={13} />
                    </button>
                    {openMenuId === p.id && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpenMenuId(null)} />
                        <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 20, minWidth: 110, padding: '4px 0' }}>
                          <button onClick={() => openEdit(p)} style={{ width: '100%', textAlign: 'left', padding: '7px 12px', fontSize: 12, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', color: 'var(--ink)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}>
                            Editar
                          </button>
                          <button onClick={() => { setOpenMenuId(null); setEditingParticipant(p); setShowForm(true) }}
                            style={{ width: '100%', textAlign: 'left', padding: '7px 12px', fontSize: 12, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', color: 'var(--red-strong)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}>
                            Eliminar
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data && (data.totalPages > 1 || participants.length > 0) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>Filas:</span>
                <select className="form-select" style={{ width: 'auto', padding: '3px 6px', fontSize: 12 }}
                  value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0) }}>
                  {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                {data.totalElements > 0 && (
                  <span className="pagination-info">{data.totalElements} participante{data.totalElements !== 1 ? 's' : ''}</span>
                )}
              </div>
              <div className="pagination" style={{ marginTop: 0 }}>
                <button className="pagination-btn" disabled={data.first} onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}>← Anterior</button>
                <span className="pagination-info">{data.number + 1} / {data.totalPages}</span>
                <button className="pagination-btn" disabled={data.last} onClick={() => setCurrentPage((p) => p + 1)}>Siguiente →</button>
              </div>
            </div>
          )}
        </>
      )}

      {viewingParticipant && (
        <ParticipantViewModal participant={viewingParticipant} requiresShirtNumbers={requiresShirtNumbers}
          onEdit={() => openEdit(viewingParticipant)} onClose={() => setViewingParticipant(null)} />
      )}

      {showForm && (
        <ParticipantFormModal competitionId={competitionId} participant={editingParticipant ?? undefined}
          requiresShirtNumbers={requiresShirtNumbers} requiresMedicalCertificates={requiresMedicalCertificates}
          localParticipants={participants} onSaved={handleSaved} onDeleted={handleDeleted}
          onClose={() => { setShowForm(false); setEditingParticipant(undefined) }} />
      )}
    </div>
  )
}
