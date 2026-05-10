import type { CompetitionStatus, RegistrationStatus, ParticipantRole, ParticipantPositionType, School, IdType, Role } from '@ubes/types'

export const COMPETITION_STATUS_LABELS: Record<CompetitionStatus, string> = {
  SCHEDULED: 'Programada',
  ON_GOING:  'En curso',
  FINISHED:  'Finalizada',
  CANCELED:  'Cancelada',
}

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  UNAVAILABLE: 'Sin inscripciones',
  SCHEDULED:   'Inscripciones programadas',
  AVAILABLE:   'Inscripciones abiertas',
  EXPIRED:     'Inscripciones cerradas',
  CANCELED:    'Inscripciones canceladas',
}

export const PARTICIPANT_ROLE_LABELS: Record<ParticipantRole, string> = {
  PARTICIPANT: 'Jugador',
  COACH:       'Entrenador',
}

export const POSITION_TYPE_LABELS: Record<ParticipantPositionType, string> = {
  INDIVIDUAL: 'Individual',
  SCHOOL:     'Escuela',
  SUPPORTER:  'Hinchas',
}

export const POSITION_TYPE_LABELS_PLURAL: Record<ParticipantPositionType, string> = {
  INDIVIDUAL: 'Jugadores',
  SCHOOL:     'Escuelas',
  SUPPORTER:  'Hinchadas',
}

export const SCHOOL_LABELS: Record<School, string> = {
  HUERTO:      'Huerto',
  SAN_JOSE:    'San José',
  NORMAL:      'Normal',
  ENET:        'ENET 267',
  ENA:         'ENA',
  POLIVALENTE: 'Polivalente',
  COMERCIAL:   'Comercial',
  ROBERTINA:   'Robertina',
  PROA:        'PROA',
  NACIONAL:    'Ex Nacional',
  CENMA:       'CENMA',
  MONTESSORI:  'Montessori',
}

export const ID_TYPE_LABELS: Record<IdType, string> = {
  DNI:      'DNI',
  PASSPORT: 'Pasaporte',
}

export const ROLE_LABELS: Record<Role, string> = {
  DEVELOPER:            'Desarrollador',
  PRESIDENT:            'Presidente',
  VICE_PRESIDENT:       'Vicepresidente',
  SECRETARY:            'Secretario/a',
  PROSECRETARY:         'Prosecretario/a',
  TREASURER:            'Tesorero/a',
  PRO_TREASURER:        'Protesorero/a',
  SPORT_SECRETARY:      'Sec. de Deportes',
  SPORT_PROSECRETARY:   'Prosec. de Deportes',
  CULTURE_SECRETARY:    'Sec. de Cultura',
  CULTURE_PROSECRETARY: 'Prosec. de Cultura',
  ENV_SECRETARY:        'Sec. de Medio Ambiente',
  ENV_PROSECRETARY:     'Prosec. de Medio Ambiente',
  PPRR_SECRETARY:       'Sec. de RRPP',
  PPRR_PROSECRETARY:    'Prosec. de RRPP',
  PRESS_SECRETARY:      'Sec. de Prensa',
  PRESS_PROSECRETARY:   'Prosec. de Prensa',
  IIRR_SECRETARY:       'Sec. de RRII',
  IIRR_PROSECRETARY:    'Prosec. de RRII',
  ADMIN_SECRETARY:      'Sec. Administrativo/a',
  ADMIN_PROSECRETARY:   'Prosec. Administrativo/a',
  DELEGATE:             'Delegado/a',
  USER:                 'Usuario',
}
