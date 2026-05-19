import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { startOfMonth, endOfMonth, addMonths, subMonths, parseISO } from 'date-fns'
import type { EventDTO } from '@ubes/types'
import { listEvents } from '@/services/eventService'
import CalendarGrid from '@/components/calendar/CalendarGrid'
import EventSidebar from '@/components/calendar/EventSidebar'

export default function CalendarioPage() {
  const [searchParams] = useSearchParams()

  const initialDate = (() => {
    const p = searchParams.get('date')
    if (!p) return null
    try { return parseISO(p) } catch { return null }
  })()

  const [currentMonth, setCurrentMonth] = useState(initialDate ? startOfMonth(initialDate) : startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate)

  useEffect(() => { if (initialDate) window.scrollTo({ top: 0, behavior: 'instant' }) }, [])
  const [events, setEvents] = useState<EventDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const [calendarHeight, setCalendarHeight] = useState<number | null>(null)

  useEffect(() => {
    const el = calendarRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      setCalendarHeight(entries[0].contentRect.height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Buffer ±3 months: only refetch when month moves outside the loaded window
  const windowRef = useRef<{ from: Date; to: Date } | null>(null)

  useEffect(() => {
    const w = windowRef.current
    if (w && currentMonth >= w.from && currentMonth <= w.to) return

    const from = startOfMonth(subMonths(currentMonth, 3))
    const to = endOfMonth(addMonths(currentMonth, 3))
    let cancelled = false
    setLoading(true)
    setError(false)

    listEvents({ from: from.toISOString(), to: to.toISOString() })
      .then(data => { if (!cancelled) { windowRef.current = { from, to }; setEvents(data); setLoading(false) } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false) } })

    return () => { cancelled = true }
  }, [currentMonth])

  const eventsThisMonth = events.filter(e =>
    parseISO(e.startingDate) <= endOfMonth(currentMonth) &&
    parseISO(e.endingDate) >= startOfMonth(currentMonth)
  )

  function handleSelectDate(date: Date | null) {
    setSelectedDate(date)
  }

  function handleChangeMonth(month: Date) {
    setCurrentMonth(month)
    setSelectedDate(null)
  }

  return (
    <div
      className="page-fade-in"
      style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '32px', color: 'var(--ink)' }}
    >
      <div className="wrap">

        {/* Page header */}
        <header className="inner-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="float-y-1">
              <div style={{
                width: '48px', height: '48px', background: 'var(--red-strong)', border: '2px solid var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow)', transform: 'rotate(3deg)',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
            </div>
            <h1 className="inner-page-title">CALENDARIO.</h1>
          </div>
          <p className="inner-page-subtitle">Agenda oficial de asambleas, competencias y eventos comunitarios.</p>
        </header>

        {/* Error state */}
        {error && (
          <div
            className="border-2 border-black p-4 mb-6 flex items-center gap-4"
            style={{ background: '#FEF2F2', boxShadow: 'var(--shadow)' }}
          >
            <span className="font-black text-red-600 text-lg">!</span>
            <p className="font-bold text-red-700">
              No pudimos cargar los eventos, intentá recargar la página.
            </p>
            <button
              className="ml-auto border-2 border-black px-4 py-2 font-black text-sm hover:bg-black hover:text-white transition-colors"
              onClick={() => { windowRef.current = null; setCurrentMonth(m => new Date(m)) }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Main layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-stretch">
          <div className="w-full lg:w-3/5" ref={calendarRef}>
            <CalendarGrid
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              events={eventsThisMonth}
              onSelectDate={handleSelectDate}
              onChangeMonth={handleChangeMonth}
            />
          </div>

          <div
            className="w-full lg:w-2/5 lg:sticky lg:top-[100px] flex flex-col overflow-hidden"
            style={calendarHeight ? { maxHeight: `${calendarHeight}px` } : undefined}
            ref={sidebarRef}
          >
            <EventSidebar
              selectedDate={selectedDate}
              currentMonth={currentMonth}
              events={events}
              onClearSelection={() => setSelectedDate(null)}
              loading={loading}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
