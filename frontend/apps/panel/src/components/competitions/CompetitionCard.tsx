import { MapPin, CalendarDays } from 'lucide-react'
import type { CompetitionDTO } from '@ubes/types'
import { getBannerFallbackColor } from '@/lib/competitionStatus'
import { formatDateTime, formatTimeRemaining } from '@/lib/dateUtils'
import StatusBadge from '@/components/ui/StatusBadge'

interface Props {
  competition: CompetitionDTO
  onClick: () => void
}

export default function CompetitionCard({ competition: c, onClick }: Props) {
  const hasBanner = !!c.bannerURL

  return (
    <div className="competition-card" onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div
        className="competition-card-bg"
        style={hasBanner
          ? { backgroundImage: `url(${c.bannerURL})` }
          : { background: getBannerFallbackColor(String(c.id)) }
        }
      />
      {/* Gradient overlay: dark for banners, subtle bottom-tint for fallback colors */}
      <div className={hasBanner ? 'competition-card-overlay' : 'competition-card-overlay-soft'} />

      <div className={`competition-card-content${hasBanner ? '' : ' competition-card-content--light'}`}>
        {/* Top: title + badge */}
        <div className="competition-card-top">
          <p className="competition-card-name">{c.name}</p>
          <div style={{ marginTop: 5 }}>
            <StatusBadge competition={c} />
          </div>
        </div>

        {/* Bottom: meta info */}
        <div className="competition-card-bottom">
          <div className="competition-card-meta">
            <CalendarDays size={11} style={{ flexShrink: 0 }} />
            <span>{formatDateTime(c.startingDate)}</span>
          </div>
          <div className="competition-card-meta">
            <MapPin size={11} style={{ flexShrink: 0 }} />
            <span>{c.location?.name || 'Sin ubicación'}</span>
          </div>
          <div className="competition-card-days">{formatTimeRemaining(c)}</div>
        </div>
      </div>
    </div>
  )
}
