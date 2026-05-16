import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, FileText } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { hasExecutiveAccess } from '@/lib/roleUtils'
import { useDebounce } from '@/hooks/useDebounce'
import DocumentService from '@/services/documentService'
import DocumentCard from '@/components/documents/DocumentCard'
import DocumentModal from '@/components/documents/DocumentModal'
import FilterDropdown, { type SortDirection } from '@/components/ui/FilterDropdown'
import Pagination from '@/components/ui/Pagination'
import type { DocumentDTO } from '@ubes/types'

type DocumentSortField = 'id' | 'name' | 'createdAt' | 'updatedAt'

const PAGE_SIZE = 16

const DOCUMENT_SORT_OPTIONS: { value: DocumentSortField; label: string }[] = [
  { value: 'id',        label: 'ID' },
  { value: 'name',      label: 'Nombre' },
  { value: 'createdAt', label: 'Fecha de Creación' },
  { value: 'updatedAt', label: 'Fecha de Modificación' },
]

function sortDocuments(docs: DocumentDTO[], field: DocumentSortField, dir: SortDirection): DocumentDTO[] {
  return [...docs].sort((a, b) => {
    let va: string | number = a[field] ?? ''
    let vb: string | number = b[field] ?? ''
    if (field === 'id') { va = Number(va); vb = Number(vb) }
    const cmp = va < vb ? -1 : va > vb ? 1 : 0
    return dir === 'asc' ? cmp : -cmp
  })
}

export default function DocumentosPage() {
  const user = useAuthStore(s => s.user)
  const canManage = user ? hasExecutiveAccess(user.role) : false

  const [documents, setDocuments] = useState<DocumentDTO[]>([])
  const [initialLoad, setInitialLoad] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [sort, setSort] = useState<DocumentSortField>('createdAt')
  const [direction, setDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<DocumentDTO | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  const debouncedSearch = useDebounce(searchInput, 300)

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, sort, direction])

  // Fetch from backend when search or fetchKey changes
  useEffect(() => {
    let cancelled = false
    setFetching(true)
    setError(null)

    const trimmed = debouncedSearch.trim()
    const params: Parameters<typeof DocumentService.list>[0] = {}
    if (trimmed) {
      if (/^\d+$/.test(trimmed)) params.id = Number(trimmed)
      else params.name = trimmed
    }

    DocumentService.list(params)
      .then(result => { if (!cancelled) setDocuments(result) })
      .catch(() => { if (!cancelled) setError('No se pudieron cargar los documentos. Intentá de nuevo.') })
      .finally(() => {
        if (!cancelled) {
          setFetching(false)
          setInitialLoad(false)
        }
      })

    return () => { cancelled = true }
  }, [debouncedSearch, fetchKey])

  const sorted = useMemo(() => sortDocuments(documents, sort, direction), [documents, sort, direction])
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const pageItems = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function handleSaved(saved: DocumentDTO | null) {
    if (saved !== null && editing && saved.id === editing.id) {
      // Update same document: patch in place
      setDocuments(prev => prev.map(d => d.id === saved.id ? saved : d))
    } else {
      // Create, delete, or different document: full refresh
      setSearchInput('')
      setSort('createdAt')
      setDirection('desc')
      setPage(0)
      setFetchKey(k => k + 1)
    }
    setEditing(null)
    setShowCreate(false)
  }

  return (
    <div className="panel-content">
      <div className="fade-up">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-heading">Listado de Documentos</h1>
            <p className="page-sub">Repositorio de documentos institucionales</p>
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

            <FilterDropdown<DocumentSortField>
              sort={sort}
              direction={direction}
              onSortChange={setSort}
              onDirectionChange={setDirection}
              sortOptions={DOCUMENT_SORT_OPTIONS}
            />

            {canManage && (
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
            <div className="documents-grid">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="document-card-skeleton" />
              ))}
            </div>
          ) : error ? (
            <div className="empty-state">
              <FileText size={36} className="empty-state-icon" />
              <p className="empty-state-text">{error}</p>
              <button className="btn btn-secondary" onClick={() => setFetchKey(k => k + 1)}>
                Reintentar
              </button>
            </div>
          ) : pageItems.length === 0 ? (
            <div className="empty-state">
              <FileText size={36} className="empty-state-icon" />
              <p className="empty-state-text">
                {searchInput ? 'Sin resultados para tu búsqueda.' : 'No hay documentos registrados.'}
              </p>
              {!searchInput && canManage && (
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                  <Plus size={13} /> Crear primer documento
                </button>
              )}
            </div>
          ) : (
            <div className="documents-grid" style={{ opacity: fetching ? 0.5 : 1, transition: 'opacity 0.15s' }}>
              {pageItems.map((d, i) => (
                <div key={d.id} className={`fade-up${i < 4 ? ` d${i + 1}` : ''}`}>
                  <DocumentCard
                    document={d}
                    onClick={() => canManage ? setEditing(d) : undefined}
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

      {showCreate && (
        <DocumentModal
          mode="create"
          onClose={() => setShowCreate(false)}
          onSaved={handleSaved}
        />
      )}

      {editing && (
        <DocumentModal
          mode="edit"
          document={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
