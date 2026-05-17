import { Calendar, X } from 'lucide-react'
import { endOfDay, endOfMonth, parseISO, startOfDay, startOfMonth } from 'date-fns'
import type { EventDTO } from '@ubes/types'
import { formatSelectedDayHeader } from '@/lib/dateUtils'
import EventSidebarCard from './EventSidebarCard'

interface Props {
  selectedDate: Date | null
  currentMonth: Date
  events: EventDTO[]
  onClearSelection: () => void
  loading: boolean
}

function eventOverlapsDay(event: EventDTO, day: Date): boolean {
  const start = startOfDay(parseISO(event.startingDate))
  const end = endOfDay(parseISO(event.endingDate))
  return start <= day && end >= day
}

function eventOverlapsMonth(event: EventDTO, month: Date): boolean {
  const start = parseISO(event.startingDate)
  const end = parseISO(event.endingDate)
  return start <= endOfMonth(month) && end >= startOfMonth(month)
}

export default function EventSidebar({ selectedDate, currentMonth, events, onClearSelection, loading }: Props) {
  const displayedEvents = selectedDate
    ? events.filter(e => eventOverlapsDay(e, selectedDate))
    : events
        .filter(e => eventOverlapsMonth(e, currentMonth))
        .sort((a, b) => a.startingDate.localeCompare(b.startingDate))

  const title = selectedDate ? 'Eventos del día' : 'Mes en curso'
  const subtitleRaw = selectedDate
    ? formatSelectedDayHeader(selectedDate)
    : currentMonth.toLocaleString('es-AR', { month: 'long', year: 'numeric' })
  const subtitle = subtitleRaw.charAt(0).toUpperCase() + subtitleRaw.slice(1)

  return (
    <aside
      className="border-2 border-black flex flex-col h-full"
      style={{ boxShadow: 'var(--shadow-lg)' }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between gap-3 p-5 border-b-2 border-black"
        style={{ background: 'var(--ink)', color: 'white' }}
      >
        <div>
          <h3 className="font-black text-lg uppercase tracking-tight leading-none">{title}</h3>
          <p className="text-xs font-mono mt-1 opacity-70">{subtitle}</p>
        </div>
        {selectedDate && (
          <button
            onClick={onClearSelection}
            className="border-2 border-white p-1 hover:bg-white hover:text-black transition-colors shrink-0"
            aria-label="Limpiar selección"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Body */}
      <div
        className="p-4 overflow-y-auto flex-1 flex flex-col gap-3"
        role="region"
        aria-label={selectedDate ? 'Eventos del día' : 'Eventos del mes'}
      >
        {loading ? (
          <>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="border-2 border-gray-200 bg-gray-100 h-28 animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </>
        ) : displayedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 border-2 border-dashed border-gray-300">
            <Calendar size={32} className="text-gray-400" />
            <p className="text-sm font-bold text-gray-500 text-center">
              {selectedDate ? 'No hay eventos este día' : 'No hay eventos este mes'}
            </p>
          </div>
        ) : (
          displayedEvents.map(event => (
            <EventSidebarCard
              key={event.id}
              event={event}
              showDate={!selectedDate}
            />
          ))
        )}
      </div>
    </aside>
  )
}
