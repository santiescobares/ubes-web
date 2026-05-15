import type { CompetitionDTO } from '@ubes/types'

export interface DisplayStatus {
  label: string
  colorClass: string
}

const FALLBACK_COLOR = '#8B6347'

export function getDisplayStatus(competition: CompetitionDTO): DisplayStatus {
  const { status, registrationStatus } = competition
  if (status === 'CANCELED') return { label: 'Cancelada', colorClass: 'badge-canceled' }
  if (status === 'FINISHED') return { label: 'Finalizada', colorClass: 'badge-finished' }
  if (status === 'ONGOING') return { label: 'En progreso', colorClass: 'badge-ongoing' }
  // SCHEDULED — follow registrationStatus
  if (registrationStatus === 'AVAILABLE') return { label: 'Inscripciones Abiertas', colorClass: 'badge-open' }
  if (registrationStatus === 'EXPIRED') return { label: 'Inscripciones Cerradas', colorClass: 'badge-closed' }
  if (registrationStatus === 'CANCELED') return { label: 'Cancelada', colorClass: 'badge-canceled' }
  return { label: 'Programada', colorClass: 'badge-scheduled' }
}

export function getBannerFallbackColor(_id: string): string {
  return FALLBACK_COLOR
}
