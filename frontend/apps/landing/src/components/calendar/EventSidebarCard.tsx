import { useState } from 'react'
import { Clock, Calendar } from 'lucide-react'
import type { EventDTO } from '@ubes/types'
import { EVENT_TYPE_META } from '@/lib/eventTypeMeta'
import { formatEventTimeRangeMultiDay } from '@/lib/dateUtils'
import { parseISO } from 'date-fns'
import MapModal from './MapModal'

interface Props {
  event: EventDTO
  showDate: boolean
}

export default function EventSidebarCard({ event, showDate }: Props) {
  const meta = EVENT_TYPE_META[event.type]
  const Icon = meta.icon
  const [mapOpen, setMapOpen] = useState(false)

  const startDate = parseISO(event.startingDate)
  const dateLabel = startDate.toLocaleString('es-AR', { day: '2-digit', month: 'short' }).toUpperCase().replace('.', '')

  const timeStr = formatEventTimeRangeMultiDay(event.startingDate, event.endingDate)
  const location = event.location ?? null
  const locationStr = location?.name ?? null
  const hasCoords = location?.latitude != null && location?.longitude != null

  return (
    <div
      className="border-2 border-black bg-white overflow-hidden shrink-0 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
      style={{ boxShadow: 'var(--shadow)' }}
    >
      {event.bannerURL && (
        <div className="w-full h-28 border-b-2 border-black">
          <img src={event.bannerURL} alt={event.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-4 flex flex-col gap-2">

        {/* Title row + type badge */}
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-black text-lg leading-tight" style={{ color: 'var(--ink)' }}>
            {event.name}
          </h4>
          <span
            className="inline-flex items-center gap-1 border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase shrink-0"
            style={{ background: meta.color, color: meta.textColor }}
          >
            <Icon size={10} />
            {meta.label}
          </span>
        </div>

        {event.description && (
          <p className="text-sm text-gray-500 leading-relaxed">{event.description}</p>
        )}

        {/* Metadata footer */}
        <div className="border-t-2 border-dashed border-gray-200 pt-2 flex flex-col gap-1">
          {showDate && (
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-500">
              <Calendar size={11} />
              <span>{dateLabel}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-600">
            <Clock size={11} />
            <span>
              {timeStr}
              {locationStr && (
                <>
                  {' • '}
                  {hasCoords ? (
                    <span
                      onClick={() => setMapOpen(true)}
                      style={{ cursor: 'pointer', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                      onMouseLeave={e => (e.currentTarget.style.color = '')}
                    >
                      {locationStr}
                    </span>
                  ) : locationStr}
                </>
              )}
            </span>
          </div>
        </div>

      </div>

      {mapOpen && hasCoords && (
        <MapModal
          locationName={locationStr!}
          lat={location!.latitude!}
          lon={location!.longitude!}
          onClose={() => setMapOpen(false)}
        />
      )}
    </div>
  )
}
