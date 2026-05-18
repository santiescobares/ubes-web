import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import type { PostDTO, PageResponse } from '@ubes/types'
import { listPosts } from '@/services/postService'
import { formatPostDayLabel, groupPostsByDay } from '@/lib/dateUtils'
import PostCard from '@/components/posts/PostCard'
import PostModal from '@/components/posts/PostModal'
import LandingPagination from '@/components/common/LandingPagination'

export default function NovedadesPage() {
  const [page, setPage] = useState(0)
  const [data, setData] = useState<PageResponse<PostDTO> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selected, setSelected] = useState<PostDTO | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    listPosts({ page, size: 5 })
      .then(res => { if (!cancelled) { setData(res); setLoading(false) } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false) } })

    return () => { cancelled = true }
  }, [page])

  function handlePageChange(p: number) {
    setPage(p - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function refetch() {
    setPage(p => p)
    setError(false)
    setLoading(true)

    listPosts({ page, size: 5 })
      .then(res => { setData(res); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }

  const posts = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div
      className="page-fade-in"
      style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '64px', background: 'var(--bg)', color: 'var(--ink)' }}
    >
      <div className="wrap" style={{ maxWidth: '820px', margin: '0 auto' }}>

        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
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
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Novedades.</h1>
          </div>
          <p className="text-base text-gray-600 font-medium w-full max-w-md md:text-right">
            Últimos anuncios y comunicados.
          </p>
        </header>

        {error && (
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
              onClick={refetch}
            >
              Reintentar
            </button>
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <Loader2 size={32} className="spin-icon" />
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: '#888', textAlign: 'center', padding: '48px 0' }}>
            No hay novedades por ahora.
          </p>
        )}

        {!loading && !error && groupPostsByDay(posts).map(g => (
          <section key={g.dayKey} className="novedades-day">
            <h3 className="novedades-day-label">{formatPostDayLabel(g.sample)}</h3>
            <div className="novedades-day-cards">
              {g.items.map(p => (
                <PostCard key={p.id} post={p} onOpen={() => setSelected(p)} />
              ))}
            </div>
          </section>
        ))}

        <LandingPagination current={page + 1} total={totalPages} onChange={handlePageChange} />

      </div>

      {selected && <PostModal post={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
