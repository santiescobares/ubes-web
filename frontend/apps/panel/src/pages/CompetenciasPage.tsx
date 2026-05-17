import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Trophy } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { hasCompetitionAccess } from '@/lib/roleUtils'
import { useDebounce } from '@/hooks/useDebounce'
import CompetitionService from '@/services/competitionService'
import CompetitionCard from '@/components/competitions/CompetitionCard'
import CreateCompetitionModal from '@/components/competitions/CreateCompetitionModal'
import FilterDropdown, { type SortField, type SortDirection } from '@/components/ui/FilterDropdown'
import Pagination from '@/components/ui/Pagination'
import type { CompetitionDTO } from '@ubes/types'

const PAGE_SIZE = 16

const COMPETITION_SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'startingDate', label: 'Fecha de Inicio' },
  { value: 'name',         label: 'Nombre' },
  { value: 'id',           label: 'ID' },
]

export default function CompetenciasPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const canCreate = user ? hasCompetitionAccess(user.role) : false

  const [competitions, setCompetitions] = useState<CompetitionDTO[]>([])
  const [initialLoad, setInitialLoad] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [sort, setSort] = useState<SortField>('startingDate')
  const [direction, setDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [fetchKey, setFetchKey] = useState(0)

  const debouncedSearch = useDebounce(searchInput, 300)

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, sort, direction])

  useEffect(() => {
    let cancelled = false
    setFetching(true)
    setError(null)

    const trimmed = debouncedSearch.trim()
    const params: Parameters<typeof CompetitionService.list>[0] = {
      page,
      size: PAGE_SIZE,
      sort,
      direction,
    }
    if (trimmed) {
      if (/^\d+$/.test(trimmed)) {
        params.id = Number(trimmed)
      } else {
        params.name = trimmed
      }
    }

    CompetitionService.list(params)
      .then(result => {
        if (!cancelled) {
          setCompetitions(result.content)
          setTotalPages(result.totalPages)
        }
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar las competencias. Intentá de nuevo.')
      })
      .finally(() => {
        if (!cancelled) {
          setFetching(false)
          setInitialLoad(false)
        }
      })

    return () => { cancelled = true }
  }, [debouncedSearch, sort, direction, page, fetchKey])

  function handleCreated(_newCompetition: CompetitionDTO) {
    setShowCreate(false)
    setSearchInput('')
    setSort('startingDate')
    setDirection('desc')
    setPage(0)
    setFetchKey(k => k + 1)
  }

  return (
    <div className="panel-content">
      <div className="fade-up">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-heading">Listado de Competencias</h1>
            <p className="page-sub">Gestión de competencias intercolegiales</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div className="search-bar">
              <Search size={13} className="search-bar-icon" />
              <input
                className="search-bar-input"
                type="text"
                placeholder="Buscar por nombre o ID..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>

            <FilterDropdown
              sort={sort}
              direction={direction}
              onSortChange={setSort}
              onDirectionChange={setDirection}
              sortOptions={COMPETITION_SORT_OPTIONS}
            />

            {canCreate && (
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                <Plus size={14} />
                Crear
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ marginTop: 24 }}>
          {initialLoad ? (
            <div className="competitions-grid">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="competition-card-skeleton" />
              ))}
            </div>
          ) : error ? (
            <div className="empty-state">
              <Trophy size={36} className="empty-state-icon" />
              <p className="empty-state-text">{error}</p>
              <button className="btn btn-secondary" onClick={() => setFetchKey(k => k + 1)}>
                Reintentar
              </button>
            </div>
          ) : competitions.length === 0 ? (
            <div className="empty-state">
              <Trophy size={36} className="empty-state-icon" />
              <p className="empty-state-text">
                {searchInput ? 'Sin resultados para tu búsqueda.' : 'No hay competencias registradas.'}
              </p>
              {!searchInput && canCreate && (
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                  <Plus size={13} /> Crear primera competencia
                </button>
              )}
            </div>
          ) : (
            <div className="competitions-grid" style={{ opacity: fetching ? 0.5 : 1, transition: 'opacity 0.15s' }}>
              {competitions.map((c, i) => (
                <div key={c.id} className={`fade-up${i < 4 ? ` d${i + 1}` : ''}`}>
                  <CompetitionCard
                    competition={c}
                    onClick={() => navigate(`/competencias/${c.id}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!initialLoad && !error && totalPages > 1 && (
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              current={page + 1}
              total={totalPages}
              onChange={p => setPage(p - 1)}
            />
          </div>
        )}
      </div>

      {/* Modal outside fade-up so position:fixed works */}
      {showCreate && (
        <CreateCompetitionModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}
