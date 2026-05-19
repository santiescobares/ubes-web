import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Loader2, Mailbox } from 'lucide-react'
import type { SuggestionDTO, SuggestionsByDateDTO, PageResponse } from '@ubes/types'
import { listSuggestionsByDate } from '@/services/suggestionService'
import { formatDayLabel } from '@/lib/dateUtils'
import { Role } from '@ubes/types'
import SuggestionCarousel from '@/components/suggestions/SuggestionCarousel'
import SuggestionModal from '@/components/suggestions/SuggestionModal'
import CreateSuggestionModal from '@/components/suggestions/CreateSuggestionModal'
import useAuthStore from '@/store/authStore'
import useAuthModalStore from '@/store/authModalStore'

const EXECUTIVE_ROLES = new Set<string>([
  Role.DEVELOPER, Role.PRESIDENT, Role.VICE_PRESIDENT, Role.SECRETARY,
])

const PAGE_SIZE = 4

export default function SugerenciasPage() {
  const initialized = useRef(false)
  const [pages, setPages] = useState<PageResponse<SuggestionsByDateDTO>[]>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(false)
  const [selected, setSelected] = useState<SuggestionDTO | null>(null)
  const [creating, setCreating] = useState(false)

  const { isAuthenticated, user } = useAuthStore()
  const { openLogin } = useAuthModalStore()

  const isAuthority = !!user && EXECUTIVE_ROLES.has(user.role)

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    setError(false)
    try {
      const nextPage = pages.length
      const res = await listSuggestionsByDate({ page: nextPage, size: PAGE_SIZE })
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

  // Flatten pages → map of date → suggestions
  const sections = (() => {
    const map = new Map<string, SuggestionDTO[]>()
    for (const page of pages) {
      for (const group of page.content) {
        const existing = map.get(group.date) ?? []
        map.set(group.date, [...existing, ...group.suggestions])
      }
    }
    return Array.from(map.entries()).map(([date, suggestions]) => ({ date, suggestions }))
  })()

  function updateSuggestionInState(updater: (s: SuggestionDTO) => SuggestionDTO, id: number) {
    setPages(prev => prev.map(page => ({
      ...page,
      content: page.content.map(group => ({
        ...group,
        suggestions: group.suggestions.map(s => s.id === id ? updater(s) : s),
      })),
    })))
    setSelected(prev => prev?.id === id ? updater(prev) : prev)
  }

  function handleVoted(id: number, inFavor: boolean) {
    updateSuggestionInState(s => ({
      ...s,
      userVote: inFavor,
      totalVotes: s.totalVotes + 1,
      votesInFavor: inFavor ? s.votesInFavor + 1 : s.votesInFavor,
    }), id)
  }

  function handleHideToggled(id: number, nowHidden: boolean) {
    updateSuggestionInState(s => ({ ...s, hidden: nowHidden }), id)
  }

  function handleCreated(suggestion: SuggestionDTO) {
    const todayKey = suggestion.createdAt.slice(0, 10)
    setPages(prev => {
      if (prev.length === 0) return prev
      const first = prev[0]
      const firstGroup = first.content[0]
      if (firstGroup?.date === todayKey) {
        return [
          {
            ...first,
            content: [
              { ...firstGroup, suggestions: [suggestion, ...firstGroup.suggestions] },
              ...first.content.slice(1),
            ],
          },
          ...prev.slice(1),
        ]
      }
      return [
        {
          ...first,
          content: [{ date: todayKey, suggestions: [suggestion] }, ...first.content],
        },
        ...prev.slice(1),
      ]
    })
  }

  function handleNewClick() {
    if (!isAuthenticated) { openLogin(); return }
    setCreating(true)
  }

  return (
    <div
      className="page-fade-in"
      style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '64px', color: 'var(--ink)' }}
    >
      <div className="wrap" style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <header className="inner-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="float-y-3">
              <div style={{
                width: '48px', height: '48px', background: 'var(--yellow)', border: '2px solid var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow)', transform: 'rotate(-3deg)',
              }}>
                <Mailbox size={24} strokeWidth={2} />
              </div>
            </div>
            <h1 className="inner-page-title">BUZÓN DE IDEAS.</h1>
          </div>
          <p className="inner-page-subtitle">Compartí tus ideas para mejorar UBES.</p>
        </header>

        {error && pages.length === 0 && (
          <div
            style={{ background: '#FEF2F2', border: '2px solid var(--ink)', boxShadow: 'var(--shadow)', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <span style={{ fontWeight: 900, color: 'var(--red-strong)', fontSize: '18px' }}>!</span>
            <p style={{ fontWeight: 700, color: '#b91c1c', margin: 0 }}>No pudimos cargar las sugerencias, intentá de nuevo.</p>
            <button
              className="btn btn-outline"
              style={{ marginLeft: 'auto', padding: '8px 16px', fontSize: '13px' }}
              onClick={() => { setError(false); setInitialLoading(true); setHasMore(true); loadMore() }}
            >
              Reintentar
            </button>
          </div>
        )}

        {initialLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
            <Loader2 size={32} className="spin-icon" />
          </div>
        )}

        {!initialLoading && sections.length === 0 && !error && (
          <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: '#888', textAlign: 'center', padding: '64px 0' }}>
            No hay sugerencias por ahora. ¡Sé el primero en publicar una!
          </p>
        )}

        {sections.map(({ date, suggestions }) => (
          <section key={date} className="sugerencias-day">
            <h3 className="sugerencias-day-label">{formatDayLabel(date)}</h3>
            <SuggestionCarousel
              suggestions={suggestions}
              isAuthority={isAuthority}
              onOpen={setSelected}
            />
          </section>
        ))}

        {hasMore && !initialLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0 0' }}>
            <button
              className="btn btn-outline"
              onClick={loadMore}
              disabled={loadingMore}
              style={{ gap: '8px', fontSize: '14px' }}
            >
              {loadingMore ? <Loader2 size={16} className="spin-icon" /> : null}
              {loadingMore ? 'Cargando…' : 'Cargar más'}
            </button>
          </div>
        )}

        {error && pages.length > 0 && (
          <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', color: 'var(--red-strong)', textAlign: 'center', padding: '16px 0' }}>
            Error al cargar más. Intentá de nuevo.
          </p>
        )}

      </div>

      <button
        className="sugerencias-fab"
        onClick={handleNewClick}
        aria-label="Nueva sugerencia"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      {selected && (
        <SuggestionModal
          suggestion={selected}
          isAuthority={isAuthority}
          currentUserId={user?.id ?? null}
          onClose={() => setSelected(null)}
          onVoted={handleVoted}
          onHideToggled={handleHideToggled}
        />
      )}

      {creating && (
        <CreateSuggestionModal
          onClose={() => setCreating(false)}
          onCreate={handleCreated}
        />
      )}
    </div>
  )
}
