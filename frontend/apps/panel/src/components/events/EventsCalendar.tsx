import { useMemo } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  format, parseISO, startOfDay, addMonths, subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { EventDTO } from '@ubes/types'
import { EVENT_TYPE_META } from '@/lib/eventTypeMeta'

interface Props {
  events: EventDTO[]
  visibleMonth: Date
  selectedDate: Date
  onMonthChange: (next: Date) => void
  onYearChange: (next: Date) => void
  onSelectDate: (d: Date) => void
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function EventsCalendar({ events, visibleMonth, selectedDate, onMonthChange, onYearChange, onSelectDate }: Props) {
  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [visibleMonth])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventDTO[]>()
    for (const e of events) {
      const start = startOfDay(parseISO(e.startingDate))
      const end = startOfDay(parseISO(e.endingDate))
      for (const d of eachDayOfInterval({ start, end })) {
        const key = format(d, 'yyyy-MM-dd')
        const list = map.get(key) ?? []
        list.push(e)
        map.set(key, list)
      }
    }
    return map
  }, [events])

  return (
    <div className="events-calendar">
      <div className="events-calendar-header">
        <div className="events-calendar-header-group">
          <button className="events-calendar-nav" onClick={() => onMonthChange(subMonths(visibleMonth, 1))} aria-label="Mes anterior">
            <ChevronLeft size={16} />
          </button>
          <span className="events-calendar-label events-calendar-label--month">
            {format(visibleMonth, 'MMMM', { locale: es })}
          </span>
          <button className="events-calendar-nav" onClick={() => onMonthChange(addMonths(visibleMonth, 1))} aria-label="Mes siguiente">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="events-calendar-header-group">
          <button className="events-calendar-nav" onClick={() => onYearChange(subMonths(visibleMonth, 12))} aria-label="Año anterior">
            <ChevronLeft size={16} />
          </button>
          <span className="events-calendar-label events-calendar-label--year">
            {format(visibleMonth, 'yyyy')}
          </span>
          <button className="events-calendar-nav" onClick={() => onYearChange(addMonths(visibleMonth, 12))} aria-label="Año siguiente">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="events-calendar-weekdays">
        {WEEKDAYS.map(d => <span key={d}>{d}</span>)}
      </div>

      <div className="events-calendar-grid">
        {gridDays.map(day => {
          const key = format(day, 'yyyy-MM-dd')
          const dayEvents = eventsByDate.get(key) ?? []
          const muted = !isSameMonth(day, visibleMonth)
          const selected = isSameDay(day, selectedDate)
          const today = isToday(day)

          let cellClass = 'events-calendar-cell'
          if (muted) cellClass += ' events-calendar-cell--muted'
          if (selected) cellClass += ' events-calendar-cell--selected'
          if (today) cellClass += ' events-calendar-cell--today'

          return (
            <button key={key} className={cellClass} onClick={() => onSelectDate(day)} aria-label={key}>
              {dayEvents.length > 0 && (
                <div className="events-calendar-cell-dots">
                  {dayEvents.slice(0, 3).map(e => (
                    <span key={e.id} className="events-calendar-dot" style={{ background: EVENT_TYPE_META[e.type].fallbackBg }} />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="events-calendar-dot-more">+{dayEvents.length - 3}</span>
                  )}
                </div>
              )}
              <span className="events-calendar-cell-day">{format(day, 'd')}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
