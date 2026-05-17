import { MapPin, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import type { UpcomingItemDTO } from '@ubes/types'
import { EVENT_TYPE_META } from '@/lib/eventTypeMeta'
import { formatCountdown } from '@/lib/dateUtils'

interface Props {
  item: UpcomingItemDTO
}

export default function UpcomingEventCard({ item }: Props) {
  const navigate = useNavigate()
  const meta = EVENT_TYPE_META[item.type]

  function handleNavigate() {
    if (item.kind === 'COMPETITION') {
      navigate(`/competencias/${item.id}`)
    } else {
      const date = format(parseISO(item.startingDate), 'yyyy-MM-dd')
      navigate(`/eventos?date=${date}`)
    }
  }

  const dateLabel = format(parseISO(item.startingDate), 'dd-MM-yyyy')

  return (
    <div
      className="upcoming-event-card"
      onClick={handleNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleNavigate()}
    >
      <div className="upcoming-event-stripe" style={{ background: meta.fallbackBg }} />
      <div className="upcoming-event-body">
        <div className="upcoming-event-title-row">
          <span className="upcoming-event-name">{item.name}</span>
        </div>
        <span className="upcoming-event-type">{meta.label} • {dateLabel}</span>
        <p className="upcoming-event-meta-line">
          <MapPin size={10} />
          {item.location?.name ?? 'Sin ubicación'}
        </p>
        <p className="upcoming-event-meta-line upcoming-event-meta-countdown">
          <Clock size={10} />
          {formatCountdown(item.startingDate, item.endingDate, item.active)}
        </p>
      </div>
      {item.active && <span className="upcoming-event-active-badge">Activo</span>}
    </div>
  )
}
