import { Clock, MapPin, CornerDownRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { EventDTO } from '@ubes/types'
import { EVENT_TYPE_META } from '@/lib/eventTypeMeta'
import { formatEventHourRange } from '@/lib/dateUtils'

interface Props {
  event: EventDTO
  onClick: () => void
  isSearch?: boolean
  onNavigate?: () => void
}

export default function EventCard({ event: e, onClick, isSearch, onNavigate }: Props) {
  const meta = EVENT_TYPE_META[e.type]

  function formatEventDate(iso: string): string {
    try { return format(parseISO(iso), 'dd/MM/yyyy') } catch { return '—' }
  }

  return (
    <div
      className="event-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={ev => ev.key === 'Enter' && onClick()}
    >
      <aside className="event-card-stripe" style={{ background: meta.fallbackBg }} />
      <div className="event-card-body">
        <div className="event-card-body-content">
          <div className="event-card-title-row">
            <span className="event-card-name">{e.name}</span>
            <span className="event-card-type-sep">·</span>
            <span className="event-card-type-label">{meta.label}</span>
            {isSearch && (
              <>
                <span className="event-card-type-sep">·</span>
                <span className="event-card-search-date">{formatEventDate(e.startingDate)}</span>
              </>
            )}
          </div>
          {e.description && (
            <p className="event-card-description">{e.description}</p>
          )}
          <div className="event-card-meta-row">
            <MapPin size={10} style={{ flexShrink: 0 }} />
            <span>{e.location?.name ?? 'Sin ubicación'}</span>
            <span className="event-card-meta-sep">·</span>
            <Clock size={10} style={{ flexShrink: 0 }} />
            <span>{formatEventHourRange(e.startingDate, e.endingDate)}</span>
          </div>
        </div>
        {isSearch && onNavigate && (
          <button
            className="event-card-navigate-btn"
            onClick={ev => { ev.stopPropagation(); onNavigate() }}
            title="Ir al evento en el calendario"
          >
            <CornerDownRight size={13} />
          </button>
        )}
      </div>
    </div>
  )
}
