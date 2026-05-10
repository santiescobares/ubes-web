import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, Plus, Trophy } from 'lucide-react'
import { CompetitionService } from '@/services/competition.service'
import { useAuthStore } from '@/store/authStore'
import { hasCompetitionAccess } from '@/lib/roleUtils'
import CompetitionCard from '@/components/competitions/CompetitionCard'
import CreateCompetitionModal from '@/components/competitions/CreateCompetitionModal'
import type { CompetitionDTO } from '@ubes/types'

const PAGE_SIZE = 9

export default function CompetenciasPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)

  const [competitions, setCompetitions] = useState<CompetitionDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showCreate, setShowCreate] = useState(false)

  const canCreate = user ? hasCompetitionAccess(user.role) : false

  async function loadCompetitions(p: number) {
    setLoading(true)
    setError(null)
    try {
      const result = await CompetitionService.getCompetitions(p, PAGE_SIZE)
      setCompetitions(result.content)
      setTotalPages(result.totalPages)
    } catch {
      setError('No se pudieron cargar las competencias. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCompetitions(page) }, [page])

  const filtered = useMemo(() => {
    if (!search.trim()) return competitions
    const q = search.toLowerCase()
    return competitions.filter(c => c.name.toLowerCase().includes(q))
  }, [competitions, search])

  function handleCreated() {
    setShowCreate(false)
    loadCompetitions(0)
    setPage(0)
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Barra de búsqueda */}
            <div className="search-bar">
              <Search size={13} className="search-bar-icon" />
              <input
                className="search-bar-input"
                type="text"
                placeholder="Buscar competencia..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Filtros (sin lógica — etapa futura) */}
            <button className="btn btn-secondary" style={{ padding: '7px 10px' }} title="Filtros">
              <SlidersHorizontal size={14} />
            </button>

            {/* Crear */}
            {canCreate && (
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                <Plus size={14} />
                Crear
              </button>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div style={{ marginTop: 24 }}>
          {loading ? (
            <div className="competitions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="competition-card-skeleton" />
              ))}
            </div>
          ) : error ? (
            <div className="empty-state">
              <Trophy size={36} className="empty-state-icon" />
              <p className="empty-state-text">{error}</p>
              <button className="btn btn-secondary" onClick={() => loadCompetitions(page)}>
                Reintentar
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Trophy size={36} className="empty-state-icon" />
              <p className="empty-state-text">
                {search ? 'Sin resultados para tu búsqueda.' : 'No hay competencias registradas.'}
              </p>
              {!search && canCreate && (
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                  <Plus size={13} /> Crear primera competencia
                </button>
              )}
            </div>
          ) : (
            <div className="competitions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {filtered.map((c, i) => (
                <div key={c.id} className={`fade-up${i < 4 ? ` d${i + 1}` : ''}`}>
                  <CompetitionCard
                    competition={c}
                    onClick={() => navigate(`/panel/competencias/${c.id}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginación */}
        {!loading && !error && totalPages > 1 && (
          <div className="pagination">
            <button className="pagination-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              ← Anterior
            </button>
            <span className="pagination-info">{page + 1} / {totalPages}</span>
            <button className="pagination-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* Modal de creación — fuera del fade-up para que position:fixed funcione */}
      {showCreate && (
        <CreateCompetitionModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}
