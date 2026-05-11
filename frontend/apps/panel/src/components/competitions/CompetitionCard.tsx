import { MapPin } from 'lucide-react'
import { COMPETITION_STATUS_LABELS } from '@/lib/labels'
import type { CompetitionDTO } from '@ubes/types'

interface Props {
  competition: CompetitionDTO
  onClick: () => void
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  SCHEDULED: { bg: 'var(--yellow)',       color: '#78350F' },
  ON_GOING:  { bg: 'var(--green-strong)', color: '#14532D' },
  FINISHED:  { bg: 'var(--blue)',         color: '#1E3A5F' },
  CANCELED:  { bg: 'var(--red)',          color: '#7F1D1D' },
}

const CARD_PALETTE = ['--yellow', '--blue', '--green', '--orange', '--purple', '--pink', '--red']

function getNameColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return `var(${CARD_PALETTE[hash % CARD_PALETTE.length]})`
}

function getRelativeLabel(ms: number, prefix: string, suffix: string): string {
  const abs = Math.abs(ms)
  if (abs < 60_000) return prefix === 'Comienza' ? 'Comienza ahora' : 'Finalizando'
  if (abs < 3_600_000) {
    const m = Math.ceil(abs / 60_000)
    return `${prefix} en ${m} minuto${m !== 1 ? 's' : ''}${suffix}`
  }
  if (abs < 86_400_000) {
    const h = Math.ceil(abs / 3_600_000)
    return `${prefix} en ${h} hora${h !== 1 ? 's' : ''}${suffix}`
  }
  if (abs < 2_592_000_000) {
    const d = Math.ceil(abs / 86_400_000)
    if (d === 0) return prefix === 'Comienza' ? 'Comienza hoy' : 'Finalizando'
    return `${prefix} en ${d} día${d !== 1 ? 's' : ''}${suffix}`
  }
  const mo = Math.ceil(abs / 2_592_000_000)
  return `${prefix} en ${mo} mes${mo !== 1 ? 'es' : ''}${suffix}`
}

function getDaysLabel(competition: CompetitionDTO): string {
  const now = Date.now()
  const { status, startingDate, endingDate } = competition

  if (status === 'SCHEDULED') {
    const diff = new Date(startingDate).getTime() - now
    if (diff <= 0) return 'Comienza hoy'
    return getRelativeLabel(diff, 'Comienza', '')
  }

  if (status === 'ON_GOING') {
    if (!endingDate) return 'En curso'
    const diff = new Date(endingDate).getTime() - now
    if (diff <= 0) return 'Finalizando'
    return getRelativeLabel(diff, 'Termina', ' restante')
  }

  if (status === 'CANCELED') return 'Cancelada'
  return 'Finalizada'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function CompetitionCard({ competition, onClick }: Props) {
  const { name, bannerURL, status, startingDate, location } = competition
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.FINISHED
  const daysLabel = getDaysLabel(competition)

  return (
    <div className="competition-card" onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()}>
      {bannerURL ? (
        <div className="competition-card-bg" style={{ backgroundImage: `url(${bannerURL})` }} />
      ) : (
        <div className="competition-card-bg" style={{ background: getNameColor(name) }} />
      )}
      <div className="competition-card-overlay" />

      <div className="competition-card-content">
        <span
          className="competition-status-badge"
          style={{ background: style.bg, color: style.color }}
        >
          {COMPETITION_STATUS_LABELS[status]}
        </span>

        <div className="competition-card-name">{name}</div>

        <div className="competition-card-meta">
          <span>{formatDate(startingDate)}</span>
          {location?.name && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={9} />
              {location.name}
            </span>
          )}
        </div>

        <div className="competition-card-days">{daysLabel}</div>
      </div>
    </div>
  )
}
