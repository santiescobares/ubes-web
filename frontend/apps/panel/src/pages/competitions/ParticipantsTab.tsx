import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Filter, MoreVertical, Plus, Search, X } from 'lucide-react'
import participantService from '@/services/participantService'
import { SCHOOL_LABEL, PARTICIPANT_ROLE_LABEL } from '@/lib/labels'
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

export default function ParticipantsTab({
  competitionId,
  requiresShirtNumbers,
  requiresMedicalCertificates,
}: Props) {
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
  // undefined = form closed, null = create mode, ParticipantDTO = edit mode
  const [showForm, setShowForm] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setCurrentPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const load = useCallback(() => {
    setLoading(true)
    participantService
      .getAll(competitionId, {
        page: currentPage,
        size: pageSize,
        search: search || undefined,
      })
      .then(setData)
      .finally(() => setLoading(false))
  }, [competitionId, currentPage, pageSize, search])

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditingParticipant(null)
    setShowForm(true)
    setOpenMenuId(null)
  }

  function openEdit(p: ParticipantDTO) {
    setViewingParticipant(null)
    setEditingParticipant(p)
    setShowForm(true)
    setOpenMenuId(null)
  }

  function openView(p: ParticipantDTO) {
    setViewingParticipant(p)
    setOpenMenuId(null)
  }

  function handleSaved(p: ParticipantDTO) {
    setShowForm(false)
    setEditingParticipant(undefined)
    // Optimistically update the row if editing, otherwise reload
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

  function handleDeleted() {
    setShowForm(false)
    setEditingParticipant(undefined)
    load()
  }

  function toggleSearch() {
    setSearchVisible((v) => {
      if (v) {
        setSearchInput('')
      } else {
        setTimeout(() => searchRef.current?.focus(), 50)
      }
      return !v
    })
  }

  const participants = data?.content ?? []

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {searchVisible ? (
            <div className="flex items-center gap-1 border border-gray-300 rounded-lg px-2 py-1 bg-white">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar participante..."
                className="text-sm outline-none w-48 text-gray-800 placeholder-gray-400"
              />
              <button
                onClick={toggleSearch}
                className="text-gray-400 hover:text-gray-600 shrink-0"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={toggleSearch}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Buscar"
            >
              <Search size={16} />
            </button>
          )}
          <button
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Filtrar"
          >
            <Filter size={16} />
          </button>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={13} />
          Agregar
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading && participants.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">Cargando...</div>
        ) : participants.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {search ? 'No hay resultados para esa búsqueda.' : 'Aún no hay participantes.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2.5 font-medium text-gray-500 w-10">#</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Nombre completo</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Rol</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Escuela</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {participants.map((p, idx) => (
                <tr
                  key={p.id}
                  onClick={() => openView(p)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-gray-400 tabular-nums">
                    {currentPage * pageSize + idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.firstName} {p.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{PARTICIPANT_ROLE_LABEL[p.role]}</td>
                  <td className="px-4 py-3 text-gray-600">{SCHOOL_LABEL[p.school]}</td>
                  <td className="px-4 py-3 relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setOpenMenuId((id) => (id === p.id ? null : p.id))}
                      className="p-1 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical size={14} />
                    </button>
                    {openMenuId === p.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[110px] py-1">
                          <button
                            onClick={() => openEdit(p)}
                            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              setOpenMenuId(null)
                              setEditingParticipant(p)
                              setShowForm(true)
                              // Trigger delete confirm via a prop trick — handled inside modal
                            }}
                            className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                          >
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
        )}

        {/* Pagination footer */}
        {data && (data.totalPages > 1 || participants.length > 0) && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Filas:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0) }}
                className="text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-white text-gray-600 focus:outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              {data.totalElements > 0 && (
                <span className="text-xs text-gray-400">
                  {data.totalElements} participante{data.totalElements !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={data.first}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs text-gray-600 px-1">{data.number + 1}</span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={data.last}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View modal */}
      {viewingParticipant && (
        <ParticipantViewModal
          participant={viewingParticipant}
          requiresShirtNumbers={requiresShirtNumbers}
          onEdit={() => openEdit(viewingParticipant)}
          onClose={() => setViewingParticipant(null)}
        />
      )}

      {/* Form modal (create or edit) */}
      {showForm && (
        <ParticipantFormModal
          competitionId={competitionId}
          participant={editingParticipant ?? undefined}
          requiresShirtNumbers={requiresShirtNumbers}
          requiresMedicalCertificates={requiresMedicalCertificates}
          localParticipants={participants}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
          onClose={() => { setShowForm(false); setEditingParticipant(undefined) }}
        />
      )}
    </div>
  )
}
