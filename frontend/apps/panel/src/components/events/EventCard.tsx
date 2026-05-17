import { Clock, MapPin, CornerDownRight } from 'lucide-react'
import { format, parseISO, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import type { EventDTO } from '@ubes/types'
import { EVENT_TYPE_META } from '@/lib/eventTypeMeta'

interface Props {
  event: EventDTO
  onClick: () => void
  isSearch?: boolean
  onNavigate?: () => void
}

function formatEventDate(iso: string): string {
  try { return format(parseISO(iso), 'dd/MM/yyyy') } catch { return '—' }
}

function formatDateHour(iso: string): string {
  try {
    return format(parseISO(iso), 'dd-MM HH:mm a', { locale: es })
      .toUpperCase()
      .replace(/\./g, '')
  } catch { return '—' }
}

function formatTimeRange(start: string, end: string): string {
  try {
    const s = parseISO(start)
    const e = parseISO(end)
    if (isSameDay(s, e)) {
      const fmt = (iso: string) =>
        format(parseISO(iso), 'h:mm a', { locale: es }).toUpperCase().replace(/\./g, '')
      const sf = fmt(start)
      const ef = fmt(end)
      return sf === ef ? sf : `${sf} – ${ef}`
    }
    return `${formatDateHour(start)} – ${formatDateHour(end)}`
  } catch { return '—' }
}

export default function EventCard({ event: e, onClick, isSearch, onNavigate }: Props) {
  const meta = EVENT_TYPE_META[e.type]

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
            <span>{formatTimeRange(e.startingDate, e.endingDate)}</span>
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
