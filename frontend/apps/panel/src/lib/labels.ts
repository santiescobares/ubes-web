import { CompetitionStatus, RegistrationStatus, School, ParticipantRole, IdType } from '@ubes/types'

export const COMPETITION_STATUS_LABEL: Record<typeof CompetitionStatus[keyof typeof CompetitionStatus], string> = {
  SCHEDULED: 'Programada',
  ON_GOING: 'En curso',
  FINISHED: 'Finalizada',
  CANCELED: 'Cancelada',
}

export const COMPETITION_STATUS_COLOR: Record<typeof CompetitionStatus[keyof typeof CompetitionStatus], string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  ON_GOING: 'bg-green-100 text-green-700',
  FINISHED: 'bg-violet-100 text-violet-700',
  CANCELED: 'bg-red-100 text-red-700',
}

export const REGISTRATION_STATUS_LABEL: Record<typeof RegistrationStatus[keyof typeof RegistrationStatus], string> = {
  UNAVAILABLE: 'No disponible',
  SCHEDULED: 'Programada',
  AVAILABLE: 'Abierta',
  EXPIRED: 'Vencida',
  CANCELED: 'Cancelada',
}

export const SCHOOL_LABEL: Record<typeof School[keyof typeof School], string> = {
  HUERTO: 'Huerto',
  SAN_JOSE: 'San José',
  NORMAL: 'Normal',
  ENET: 'ENET',
  ENA: 'ENA',
  POLIVALENTE: 'Polivalente',
  COMERCIAL: 'Comercial',
  ROBERTINA: 'Robertina',
  PROA: 'PROA',
  NACIONAL: 'Nacional',
  CENMA: 'CENMA',
  MONTESSORI: 'Montessori',
}

export const PARTICIPANT_ROLE_LABEL: Record<typeof ParticipantRole[keyof typeof ParticipantRole], string> = {
  PARTICIPANT: 'Jugador',
  COACH: 'Entrenador',
}

export const ID_TYPE_LABEL: Record<typeof IdType[keyof typeof IdType], string> = {
  DNI: 'DNI',
  PASSPORT: 'Pasaporte',
}
