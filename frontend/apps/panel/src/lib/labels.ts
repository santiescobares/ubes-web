import type { CompetitionStatus, RegistrationStatus } from '@ubes/types'

export const COMPETITION_STATUS_LABELS: Record<CompetitionStatus, string> = {
  SCHEDULED: 'Programada',
  ONGOING: 'En progreso',
  FINISHED: 'Finalizada',
  CANCELED: 'Cancelada',
}

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  UNAVAILABLE: 'Programada',
  AVAILABLE: 'Inscripciones Abiertas',
  EXPIRED: 'Inscripciones Cerradas',
  CANCELED: 'Cancelada',
}
