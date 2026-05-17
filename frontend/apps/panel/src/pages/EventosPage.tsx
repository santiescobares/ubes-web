import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { startOfMonth, startOfDay, parseISO, addMonths, subMonths, endOfMonth, parse, isValid } from 'date-fns'
import { Search, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { canManageEvents } from '@/lib/roleUtils'
import { formatSelectedDayHeader } from '@/lib/dateUtils'
import EventService from '@/services/eventService'
import EventsCalendar from '@/components/events/EventsCalendar'
import EventCard from '@/components/events/EventCard'
import EventModal from '@/components/events/EventModal'
import type { EventDTO } from '@ubes/types'

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; event: EventDTO }
  | null

export default function EventosPage() {
  const user = useAuthStore(s => s.user)
  const [searchParams] = useSearchParams()
  const today = useMemo(() => new Date(), [])

  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(today))
  const [selectedDate, setSelectedDate] = useState(today)
  const [searchInput, setSearchInput] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [searchResults, setSearchResults] = useState<EventDTO[] | null>(null)
  const [events, setEvents] = useState<EventDTO[]>([])
  const [fetchKey, setFetchKey] = useState(0)
  const [modal, setModal] = useState<ModalState>(null)

  const triggerRefetch = useCallback(() => setFetchKey(k => k + 1), [])

  useEffect(() => {
    const dateParam = searchParams.get('date')
    if (dateParam) {
      try {
        const parsed = parse(dateParam, 'yyyy-MM-dd', new Date())
        if (isValid(parsed)) {
          setSelectedDate(parsed)
          setVisibleMonth(startOfMonth(parsed))
        }
      } catch { /* ignore */ }
    }
  }, [searchParams])

  // Fetch ventana de 6 meses cuando NO hay búsqueda activa
  useEffect(() => {
    let cancelled = false
    const from = startOfMonth(subMonths(visibleMonth, 3)).toISOString()
    const to = endOfMonth(addMonths(visibleMonth, 3)).toISOString()
    EventService.list({ from, to }).then(data => { if (!cancelled) setEvents(data) })
    return () => { cancelled = true }
  }, [visibleMonth, fetchKey])

  function handleSearch() {
    const q = searchInput.trim()
    if (!q) return
    setActiveQuery(q)
    const params = /^\d+$/.test(q) ? { id: Number(q) } : { name: q }
    EventService.list(params).then(data => setSearchResults(data))
  }

  function clearSearch() {
    setSearchInput('')
    setActiveQuery('')
    setSearchResults(null)
  }

  const eventsOfSelectedDay = useMemo(() => {
    const d = startOfDay(selectedDate)
    return events.filter(e => {
      const s = startOfDay(parseISO(e.startingDate))
      const f = startOfDay(parseISO(e.endingDate))
      return d >= s && d <= f
    })
  }, [events, selectedDate])

  const canManage = user ? canManageEvents(user.role) : false

  function navigateToEvent(event: EventDTO) {
    const date = parseISO(event.startingDate)
    setSelectedDate(date)
    setVisibleMonth(startOfMonth(date))
    clearSearch()
  }

  function handleSaved(saved: EventDTO | null) {
    if (saved === null) {
      const deletedId = modal && modal.mode === 'edit' ? modal.event.id : null
      if (deletedId) {
        setEvents(prev => prev.filter(e => e.id !== deletedId))
        if (searchResults) setSearchResults(prev => prev?.filter(e => e.id !== deletedId) ?? null)
      }
    } else {
      triggerRefetch()
      if (searchResults && activeQuery) {
        const params = /^\d+$/.test(activeQuery) ? { id: Number(activeQuery) } : { name: activeQuery }
        EventService.list(params).then(data => setSearchResults(data))
      }
    }
  }

  const isSearchMode = searchResults !== null
  const rightHeader = isSearchMode
    ? `${searchResults.length} ${searchResults.length === 1 ? 'evento encontrado' : 'eventos encontrados'}`
    : formatSelectedDayHeader(selectedDate)
  const displayedEvents = isSearchMode ? searchResults : eventsOfSelectedDay

  return (
    <div className="panel-content">
      <div className="events-page fade-up">
        <div className="events-page-left">
          <div className="events-page-toolbar">
            <div>
              <h1 className="page-heading">Calendario de Eventos</h1>
              <p className="page-sub">Calendario y gestión de eventos institucionales</p>
            </div>
            <div className="search-bar">
              <Search size={13} className="search-bar-icon" />
              <input
                className="search-bar-input"
                type="text"
                placeholder="Buscar por nombre o ID..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSearch()
                  if (e.key === 'Escape') clearSearch()
                }}
              />
              {isSearchMode && (
                <button className="search-bar-clear" onClick={clearSearch} title="Limpiar búsqueda">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
          <EventsCalendar
            events={events}
            visibleMonth={visibleMonth}
            selectedDate={selectedDate}
            onMonthChange={setVisibleMonth}
            onYearChange={setVisibleMonth}
            onSelectDate={d => { setSelectedDate(d); clearSearch() }}
          />
        </div>

        <div className="events-page-right">
          <div className="events-day-header">
            {rightHeader}
          </div>
          <div className="events-day-list">
            {displayedEvents.length === 0
              ? <div className="events-day-empty">
                  {isSearchMode ? 'No se encontraron eventos.' : 'Sin eventos para este día.'}
                </div>
              : displayedEvents.map(e => (
                  <EventCard
                    key={e.id}
                    event={e}
                    onClick={() => canManage ? setModal({ mode: 'edit', event: e }) : undefined}
                    isSearch={isSearchMode}
                    onNavigate={isSearchMode ? () => navigateToEvent(e) : undefined}
                  />
                ))
            }
          </div>
          {canManage && (
            <div className="events-day-cta">
              <button
                className="btn btn-primary btn-full"
                onClick={() => setModal({ mode: 'create' })}
              >
                Crear
              </button>
            </div>
          )}
        </div>
      </div>

      {modal?.mode === 'create' && (
        <EventModal
          mode="create"
          baseDate={selectedDate}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
      {modal?.mode === 'edit' && (
        <EventModal
          mode="edit"
          event={modal.event}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
