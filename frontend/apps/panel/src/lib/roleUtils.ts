import { Role, RoleAuthority } from '@ubes/types'

const ROLE_AUTHORITY_MAP: Record<Role, RoleAuthority> = {
  DEVELOPER:            RoleAuthority.EXECUTIVE,
  PRESIDENT:            RoleAuthority.EXECUTIVE,
  VICE_PRESIDENT:       RoleAuthority.EXECUTIVE,
  SECRETARY:            RoleAuthority.EXECUTIVE,
  PROSECRETARY:         RoleAuthority.EXECUTIVE,
  TREASURER:            RoleAuthority.EXECUTIVE,
  PRO_TREASURER:        RoleAuthority.EXECUTIVE,
  SPORT_SECRETARY:      RoleAuthority.COMPETITION,
  SPORT_PROSECRETARY:   RoleAuthority.COMPETITION,
  CULTURE_SECRETARY:    RoleAuthority.COMPETITION,
  CULTURE_PROSECRETARY: RoleAuthority.COMPETITION,
  ENV_SECRETARY:        RoleAuthority.COMPETITION,
  ENV_PROSECRETARY:     RoleAuthority.COMPETITION,
  PPRR_SECRETARY:       RoleAuthority.PRESS,
  PPRR_PROSECRETARY:    RoleAuthority.PRESS,
  PRESS_SECRETARY:      RoleAuthority.PRESS,
  PRESS_PROSECRETARY:   RoleAuthority.PRESS,
  IIRR_SECRETARY:       RoleAuthority.NONE,
  IIRR_PROSECRETARY:    RoleAuthority.NONE,
  ADMIN_SECRETARY:      RoleAuthority.CANTEEN,
  ADMIN_PROSECRETARY:   RoleAuthority.CANTEEN,
  DELEGATE:             RoleAuthority.DELEGATE,
  USER:                 RoleAuthority.NONE,
}

export function getAuthority(role: Role): RoleAuthority {
  return ROLE_AUTHORITY_MAP[role] ?? RoleAuthority.NONE
}

export function hasCompetitionAccess(role: Role): boolean {
  const auth = getAuthority(role)
  return auth === RoleAuthority.EXECUTIVE || auth === RoleAuthority.COMPETITION
}

export function hasExecutiveAccess(role: Role): boolean {
  return getAuthority(role) === RoleAuthority.EXECUTIVE
}
