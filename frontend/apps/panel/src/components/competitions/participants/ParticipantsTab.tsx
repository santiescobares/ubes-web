import { useState, useEffect, useCallback } from 'react'
import { Plus, Search } from 'lucide-react'
import type { CompetitionDTO, ParticipantDTO } from '@ubes/types'
import { ParticipantRole } from '@ubes/types'
import { useDebounce } from '@/hooks/useDebounce'
import Pagination from '@/components/ui/Pagination'
import FilterDropdown, { type SortDirection } from '@/components/ui/FilterDropdown'
import ParticipantService from '@/services/participantService'
import ParticipantModal from './ParticipantModal'

type ParticipantSortField = 'id' | 'firstName' | 'lastName' | 'school' | 'createdAt'

const PARTICIPANT_SORT_OPTIONS: { value: ParticipantSortField; label: string }[] = [
  { value: 'id',        label: 'ID' },
  { value: 'firstName', label: 'Nombre' },
  { value: 'lastName',  label: 'Apellido' },
  { value: 'school',    label: 'Escuela' },
  { value: 'createdAt', label: 'Fecha de registro' },
]

const SCHOOL_LABELS: Record<string, string> = {
  HUERTO: 'Huerto', SAN_JOSE: 'San José', NORMAL: 'Normal', ENET: 'ENET',
  ENA: 'ENA', POLIVALENTE: 'Polivalente', COMERCIAL: 'Comercial', ROBERTINA: 'Robertina',
  PROA: 'PROA', NACIONAL: 'Nacional', CENMA: 'CENMA', MONTESSORI: 'Montessori',
}

const ROLE_LABELS: Record<string, string> = {
  PARTICIPANT: 'Participante',
  COACH: 'Entrenador',
}

type ModalState = { mode: 'view' | 'edit' | 'create'; participant?: ParticipantDTO } | null

interface Props {
  competition: CompetitionDTO
}

export default function ParticipantsTab({ competition }: Props) {
  const [participants, setParticipants] = useState<ParticipantDTO[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [sort, setSort] = useState<ParticipantSortField>('id')
  const [direction, setDirection] = useState<SortDirection>('asc')
  const [modal, setModal] = useState<ModalState>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const debouncedSearch = useDebounce(searchInput, 300)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await ParticipantService.list(competition.id, {
        page: page - 1,
        size: 15,
        sort,
        direction,
        search: debouncedSearch || undefined,
      })
      setParticipants(result.content)
      setTotalPages(result.totalPages || 1)
    } catch {
      // silently fail; error shown on next retry
    } finally {
      setLoading(false)
    }
  }, [competition.id, page, sort, direction, debouncedSearch, refreshKey])

  useEffect(() => { load() }, [load])

  useEffect(() => { setPage(1) }, [debouncedSearch, sort, direction])

  function handleSaved() {
    setRefreshKey(k => k + 1)
    setModal(null)
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Toolbar */}
        <div className="panel-toolbar">
          <span style={{ fontWeight: 700, fontSize: 13 }}>Participantes Registrados</span>
          <div className="panel-toolbar-right">
            <div className="search-bar" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, color: 'var(--muted-light)', pointerEvents: 'none' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 28, fontSize: 13, height: 34 }}
                placeholder="Buscar participante..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
            <FilterDropdown<ParticipantSortField>
              sort={sort}
              direction={direction}
              onSortChange={setSort}
              onDirectionChange={setDirection}
              sortOptions={PARTICIPANT_SORT_OPTIONS}
            />
            {competition.registrationStatus === 'AVAILABLE' && (
              <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
                <Plus size={13} /> Agregar
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Cargando...</p>
        ) : participants.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            {debouncedSearch ? 'Sin resultados para la búsqueda' : 'No hay participantes registrados'}
          </p>
        ) : (
          <table className="data-table participants-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Escuela</th>
                {competition.requiresShirtNumbers && <th>Camiseta</th>}
              </tr>
            </thead>
            <tbody>
              {participants.map((p, i) => (
                <tr key={p.id} onClick={() => setModal({ mode: 'view', participant: p })}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted-light)' }}>
                    {(page - 1) * 15 + i + 1}
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</td>
                  <td>{ROLE_LABELS[p.role] ?? p.role}</td>
                  <td>{SCHOOL_LABELS[p.school] ?? p.school}</td>
                  {competition.requiresShirtNumbers && (
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {p.role === ParticipantRole.COACH ? '—' : (p.shirtNumber ?? '—')}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Pagination current={page} total={totalPages} onChange={setPage} />
      </div>

      {modal && (
        <ParticipantModal
          competition={competition}
          mode={modal.mode}
          participant={modal.participant}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}
