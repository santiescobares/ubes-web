import { Role, RoleAuthority } from '@ubes/types'

const ROLE_AUTHORITY_MAP: Record<Role, RoleAuthority> = {
  DEVELOPER:        RoleAuthority.EXECUTIVE,
  PRESIDENT:        RoleAuthority.EXECUTIVE,
  VICE_PRESIDENT:   RoleAuthority.EXECUTIVE,
  SECRETARY:        RoleAuthority.EXECUTIVE,
  SPORT_SECRETARY:  RoleAuthority.COMPETITION,
  CULTURE_SECRETARY:RoleAuthority.COMPETITION,
  PRESS_SECRETARY:  RoleAuthority.PRESS,
  ADMIN_SECRETARY:  RoleAuthority.CANTEEN,
  CANTEEN_SECRETARY:RoleAuthority.CANTEEN,
  IIRR_SECRETARY:   RoleAuthority.NONE,
  DELEGATE:         RoleAuthority.NONE,
  USER:             RoleAuthority.NONE,
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
