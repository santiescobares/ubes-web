import { useEffect, useState } from 'react'
import { Search, Plus, Megaphone } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { canManagePosts } from '@/lib/roleUtils'
import { useDebounce } from '@/hooks/useDebounce'
import PostService from '@/services/postService'
import PostCard from '@/components/posts/PostCard'
import PostModal from '@/components/posts/PostModal'
import FilterDropdown, { type SortDirection } from '@/components/ui/FilterDropdown'
import Pagination from '@/components/ui/Pagination'
import type { PostDTO } from '@ubes/types'

type PostSortField = 'id' | 'title' | 'createdAt' | 'updatedAt'

const POST_SORT_OPTIONS: { value: PostSortField; label: string }[] = [
  { value: 'createdAt', label: 'Fecha de Creación' },
  { value: 'updatedAt', label: 'Fecha de Modificación' },
  { value: 'title',     label: 'Título' },
  { value: 'id',        label: 'ID' },
]

export default function AnunciosPage() {
  const user = useAuthStore(s => s.user)
  const canManage = user ? canManagePosts(user.role) : false

  const [posts, setPosts] = useState<PostDTO[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [initialLoad, setInitialLoad] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [sort, setSort] = useState<PostSortField>('createdAt')
  const [direction, setDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<PostDTO | null>(null)
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
    const params: Parameters<typeof PostService.list>[0] = {
      page,
      size: 5,
      sort: `${sort},${direction}`,
    }
    if (trimmed) {
      if (/^\d+$/.test(trimmed)) params.id = Number(trimmed)
      params.slug = trimmed
    }

    PostService.list(params)
      .then(data => {
        if (!cancelled) {
          setPosts(data.content)
          setTotalPages(data.totalPages)
        }
      })
      .catch(() => { if (!cancelled) setError('No se pudieron cargar los anuncios. Intentá de nuevo.') })
      .finally(() => {
        if (!cancelled) {
          setFetching(false)
          setInitialLoad(false)
        }
      })

    return () => { cancelled = true }
  }, [debouncedSearch, sort, direction, page, fetchKey])

  function handleSaved(saved: PostDTO | null) {
    if (saved !== null && editing && saved.id === editing.id) {
      setPosts(prev => prev.map(p => p.id === saved.id ? saved : p))
    } else {
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
            <h1 className="page-heading">Panel de Anuncios</h1>
            <p className="page-sub">Publicación y gestión de anuncios institucionales</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div className="search-bar">
              <Search size={13} className="search-bar-icon" />
              <input
                className="search-bar-input"
                type="text"
                placeholder="Buscar por título o ID..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>

            <FilterDropdown<PostSortField>
              sort={sort}
              direction={direction}
              onSortChange={setSort}
              onDirectionChange={setDirection}
              sortOptions={POST_SORT_OPTIONS}
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
            <div className="posts-list">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="post-card" style={{ height: 110, background: 'var(--surface-muted, #f5f5f5)', border: 'none' }} />
              ))}
            </div>
          ) : error ? (
            <div className="empty-state">
              <Megaphone size={36} className="empty-state-icon" />
              <p className="empty-state-text">{error}</p>
              <button className="btn btn-secondary" onClick={() => setFetchKey(k => k + 1)}>
                Reintentar
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <Megaphone size={36} className="empty-state-icon" />
              <p className="empty-state-text">
                {searchInput ? 'Sin resultados para tu búsqueda.' : 'No hay anuncios publicados.'}
              </p>
              {!searchInput && canManage && (
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                  <Plus size={13} /> Crear primer anuncio
                </button>
              )}
            </div>
          ) : (
            <div className="posts-list" style={{ opacity: fetching ? 0.5 : 1, transition: 'opacity 0.15s' }}>
              {posts.map((p, i) => (
                <div key={p.id} className={`fade-up${i < 4 ? ` d${i + 1}` : ''}`}>
                  <PostCard
                    post={p}
                    onClick={canManage ? () => setEditing(p) : undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!initialLoad && !error && (
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
        <PostModal
          mode="create"
          onClose={() => setShowCreate(false)}
          onSaved={handleSaved}
        />
      )}

      {editing && (
        <PostModal
          mode="edit"
          post={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
