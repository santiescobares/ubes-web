import { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import type { PostDTO, PageResponse } from '@ubes/types'
import { listPosts } from '@/services/postService'
import { formatPostDayLabel, groupPostsByDay } from '@/lib/dateUtils'
import PostCard from '@/components/posts/PostCard'
import PostModal from '@/components/posts/PostModal'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

const PAGE_SIZE = 8

export default function NovedadesPage() {
  const initialized = useRef(false)
  const [pages, setPages] = useState<PageResponse<PostDTO>[]>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(false)
  const [selected, setSelected] = useState<PostDTO | null>(null)

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    setError(false)
    try {
      const nextPage = pages.length
      const res = await listPosts({ page: nextPage, size: PAGE_SIZE })
      setPages(prev => [...prev, res])
      setHasMore(!res.last && res.content.length > 0)
    } catch {
      setError(true)
    } finally {
      setLoadingMore(false)
      setInitialLoading(false)
    }
  }, [loadingMore, hasMore, pages.length])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    loadMore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sentinelRef = useInfiniteScroll(
    useCallback(() => { if (!loadingMore && hasMore && !error) loadMore() }, [loadMore, loadingMore, hasMore, error]),
    { rootMargin: '200px' },
  )

  const allPosts = pages.flatMap(p => p.content)
  const sections = groupPostsByDay(allPosts)

  return (
    <div
      className="page-fade-in"
      style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '64px', color: 'var(--ink)' }}
    >
      <div className="wrap" style={{ maxWidth: '820px', margin: '0 auto' }}>

        <header className="inner-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="float-y-3">
              <div style={{
                width: '48px', height: '48px', background: 'var(--blue-strong)', border: '2px solid var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow)', transform: 'rotate(-3deg)',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 11-5.8-1.6" />
                </svg>
              </div>
            </div>
            <h1 className="inner-page-title">NOVEDADES.</h1>
          </div>
          <p className="inner-page-subtitle">Últimos anuncios y comunicados.</p>
        </header>

        {error && pages.length === 0 && (
          <div
            className="border-2 border-black p-4 mb-6 flex items-center gap-4"
            style={{ background: '#FEF2F2', boxShadow: 'var(--shadow)' }}
          >
            <span className="font-black text-red-600 text-lg">!</span>
            <p className="font-bold text-red-700">
              No pudimos cargar las novedades, intentá recargar la página.
            </p>
            <button
              className="ml-auto border-2 border-black px-4 py-2 font-black text-sm hover:bg-black hover:text-white transition-colors"
              onClick={() => { setError(false); setInitialLoading(true); setHasMore(true); loadMore() }}
            >
              Reintentar
            </button>
          </div>
        )}

        {initialLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <Loader2 size={32} className="spin-icon" />
          </div>
        )}

        {!initialLoading && !error && sections.length === 0 && (
          <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: '#888', textAlign: 'center', padding: '48px 0' }}>
            No hay novedades por ahora.
          </p>
        )}

        {sections.map(g => (
          <section key={g.dayKey} className="novedades-day">
            <h3 className="novedades-day-label">{formatPostDayLabel(g.sample)}</h3>
            <div className="novedades-day-cards">
              {g.items.map(p => (
                <PostCard key={p.id} post={p} onOpen={() => setSelected(p)} />
              ))}
            </div>
          </section>
        ))}

        {!initialLoading && (
          <div ref={sentinelRef} style={{ height: '1px' }} />
        )}

        {loadingMore && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0 0' }}>
            <Loader2 size={24} className="spin-icon" />
          </div>
        )}

        {error && pages.length > 0 && (
          <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', color: 'var(--red-strong)', textAlign: 'center', padding: '16px 0' }}>
            Error al cargar más. Intentá de nuevo.
          </p>
        )}

      </div>

      {selected && <PostModal post={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
