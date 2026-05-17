import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format, addDays, startOfWeek, getDay, getDaysInMonth, addMonths, subMonths, parseISO, isSameDay,
  startOfDay, endOfDay,
} from 'date-fns'
import { es } from 'date-fns/locale'
import type { EventDTO } from '@ubes/types'
import CalendarDayCell from './CalendarDayCell'

interface Props {
  currentMonth: Date
  selectedDate: Date | null
  events: EventDTO[]
  onSelectDate: (d: Date | null) => void
  onChangeMonth: (d: Date) => void
}

const SUN = startOfWeek(new Date(2024, 0, 7), { weekStartsOn: 0 })
const WEEKDAYS = Array.from({ length: 7 }, (_, i) => {
  const s = format(addDays(SUN, i), 'EEEEEE', { locale: es })
  return s.charAt(0).toUpperCase() + s.slice(1)
})

export default function CalendarGrid({ currentMonth, selectedDate, events, onSelectDate, onChangeMonth }: Props) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDayOfWeek = getDay(new Date(year, month, 1))

  const eventsByDay = new Map<number, EventDTO[]>()
  const monthStart = startOfDay(new Date(year, month, 1))
  const monthEnd = endOfDay(new Date(year, month, daysInMonth))

  for (const event of events) {
    const start = parseISO(event.startingDate)
    const end = parseISO(event.endingDate)
    const cursor = new Date(Math.max(start.getTime(), monthStart.getTime()))
    const clampedEnd = new Date(Math.min(end.getTime(), monthEnd.getTime()))

    while (cursor <= clampedEnd) {
      if (cursor.getFullYear() === year && cursor.getMonth() === month) {
        const day = cursor.getDate()
        if (!eventsByDay.has(day)) eventsByDay.set(day, [])
        eventsByDay.get(day)!.push(event)
      }
      cursor.setDate(cursor.getDate() + 1)
    }
  }

  const monthLabel = format(currentMonth, 'MMMM', { locale: es })
  const monthCapitalized = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  function handleSelectDay(day: number) {
    const date = new Date(year, month, day)
    if (selectedDate && isSameDay(selectedDate, date)) {
      onSelectDate(null)
    } else {
      onSelectDate(date)
    }
  }

  return (
    <div
      className="border-2 border-black"
      style={{ boxShadow: 'var(--shadow-lg)', background: 'var(--bg)' }}
    >
      {/* Month header */}
      <div className="flex items-center justify-between px-5 py-4 border-b-2 border-black">
        <button
          onClick={() => onChangeMonth(subMonths(currentMonth, 1))}
          className="border-2 border-black p-1.5 hover:bg-black hover:text-white transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center">
          <span className="font-black text-2xl md:text-3xl uppercase tracking-tighter" style={{ color: 'var(--ink)' }}>
            {monthCapitalized}
          </span>
          <span className="font-mono text-sm text-gray-400 ml-2">{year}</span>
        </div>

        <button
          onClick={() => onChangeMonth(addMonths(currentMonth, 1))}
          className="border-2 border-black p-1.5 hover:bg-black hover:text-white transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b-2 border-black">
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="text-center py-2 font-black text-xs uppercase tracking-widest border-r-2 border-black last:border-r-0"
            style={{ color: 'var(--ink)' }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {/* Leading empty cells */}
        {Array.from({ length: firstDayOfWeek }, (_, i) => (
          <div
            key={`empty-${i}`}
            className="min-h-[70px] md:min-h-[90px] border-r-2 border-b-2 border-black bg-gray-50 [&:nth-child(7n)]:border-r-0"
          />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const dayEvents = eventsByDay.get(day) ?? []
          const date = new Date(year, month, day)
          const isSelected = selectedDate ? isSameDay(selectedDate, date) : false

          return (
            <CalendarDayCell
              key={day}
              day={day}
              month={monthCapitalized}
              isSelected={isSelected}
              dayEvents={dayEvents}
              onSelect={() => handleSelectDay(day)}
            />
          )
        })}

        {/* Trailing empty cells to complete last row */}
        {(() => {
          const total = firstDayOfWeek + daysInMonth
          const trailing = total % 7 === 0 ? 0 : 7 - (total % 7)
          return Array.from({ length: trailing }, (_, i) => (
            <div
              key={`trail-${i}`}
              className="min-h-[70px] md:min-h-[90px] border-r-2 border-b-2 border-black bg-gray-50 [&:nth-child(7n)]:border-r-0"
            />
          ))
        })()}
      </div>
    </div>
  )
}
