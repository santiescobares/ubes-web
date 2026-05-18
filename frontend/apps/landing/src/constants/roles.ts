import { Role } from '@ubes/types'

export const ROLE_LABELS: Record<Role, string> = {
  [Role.DEVELOPER]:        'Desarrollador',
  [Role.PRESIDENT]:        'Presidente',
  [Role.VICE_PRESIDENT]:   'Vicepresidente',
  [Role.SECRETARY]:        'Secretario/a',
  [Role.SPORT_SECRETARY]:  'Secretario/a de Deportes',
  [Role.CULTURE_SECRETARY]:'Secretario/a de Cultura',
  [Role.PRESS_SECRETARY]:  'Secretario/a de Prensa',
  [Role.ADMIN_SECRETARY]:  'Secretario/a Administrativo/a',
  [Role.IIRR_SECRETARY]:   'Secretario/a de RRII',
  [Role.CANTEEN_SECRETARY]:'Secretario/a de Cantina',
  [Role.DELEGATE]:         'Delegado/a',
  [Role.USER]:             'Usuario',
}
