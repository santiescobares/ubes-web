import { Role, School } from '@ubes/types'

export const SCHOOL_LABELS: Record<School, string> = {
  HUERTO:     'Huerto',
  SAN_JOSE:   'San José',
  NORMAL:     'Normal',
  ENET:       'ENET',
  ENA:        'ENA',
  POLIVALENTE:'Polivalente',
  COMERCIAL:  'Comercial',
  ROBERTINA:  'Robertina',
  PROA:       'PROA',
  NACIONAL:   'Nacional',
  CENMA:      'CENMA',
  MONTESSORI: 'Montessori',
}

export const ROLE_LABELS: Record<Role, string> = {
  DEVELOPER:         'Desarrollador',
  PRESIDENT:         'Presidente',
  VICE_PRESIDENT:    'Vicepresidente',
  SECRETARY:         'Secretario',
  SPORT_SECRETARY:   'Sec. Deportes',
  CULTURE_SECRETARY: 'Sec. Cultura',
  PRESS_SECRETARY:   'Sec. Prensa',
  ADMIN_SECRETARY:   'Sec. Administración',
  CANTEEN_SECRETARY: 'Sec. Cantina',
  IIRR_SECRETARY:    'Sec. RR.II.',
  DELEGATE:          'Delegado',
  USER:              'Usuario',
}

export const ASSIGNABLE_ROLES: Role[] = [
  'SPORT_SECRETARY',
  'CULTURE_SECRETARY',
  'PRESS_SECRETARY',
  'ADMIN_SECRETARY',
  'CANTEEN_SECRETARY',
  'IIRR_SECRETARY',
  'DELEGATE',
  'USER',
]
