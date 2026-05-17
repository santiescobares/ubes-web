import { useState } from 'react'
import type { EventDTO } from '@ubes/types'
import { EVENT_TYPE_META } from '@/lib/eventTypeMeta'

interface Props {
  day: number
  month: string
  isSelected: boolean
  dayEvents: EventDTO[]
  onSelect: () => void
}

export default function CalendarDayCell({ day, month, isSelected, dayEvents, onSelect }: Props) {
  const [hovered, setHovered] = useState(false)
  const visibleDots = dayEvents.slice(0, 3)
  const overflow = dayEvents.length - 3

  const bg = isSelected ? 'var(--ink)' : hovered ? '#FEFCE8' : 'white'
  const color = isSelected ? 'white' : 'var(--ink)'

  return (
    <button
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={`${day} de ${month}, ${dayEvents.length} evento${dayEvents.length !== 1 ? 's' : ''}`}
      className="min-h-[70px] md:min-h-[90px] border-r-2 border-b-2 border-black p-2 cursor-pointer transition-colors relative flex flex-col w-full text-left [&:nth-child(7n)]:border-r-0"
      style={{ background: bg, color }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="font-black text-lg md:text-xl leading-none">{day}</span>

      {dayEvents.length > 0 && (
        <div className="flex gap-1 justify-center mt-auto pb-1 flex-wrap">
          {visibleDots.map((event) => (
            <span
              key={event.id}
              className="w-3 h-3 rounded-full border border-black shrink-0"
              style={{
                background: isSelected ? 'white' : EVENT_TYPE_META[event.type].dotColor,
                opacity: isSelected ? 0.9 : 1,
              }}
              aria-hidden="true"
              title={EVENT_TYPE_META[event.type].label}
            />
          ))}
          {overflow > 0 && (
            <span
              className="w-3 h-3 rounded-full border border-black flex items-center justify-center font-mono font-black shrink-0"
              style={{
                background: isSelected ? 'rgba(255,255,255,0.3)' : '#D1D5DB',
                fontSize: '7px',
                color: isSelected ? 'white' : '#374151',
              }}
              aria-hidden="true"
            >
              +{overflow}
            </span>
          )}
        </div>
      )}
    </button>
  )
}
