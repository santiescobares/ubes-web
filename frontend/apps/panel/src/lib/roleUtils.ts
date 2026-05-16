import { Role, RoleAuthority } from '@ubes/types'

const ROLE_RANK: Record<Role, number> = {
  DEVELOPER:         6,
  PRESIDENT:         5,
  VICE_PRESIDENT:    4,
  SECRETARY:         3,
  SPORT_SECRETARY:   2,
  CULTURE_SECRETARY: 2,
  PRESS_SECRETARY:   2,
  ADMIN_SECRETARY:   2,
  CANTEEN_SECRETARY: 2,
  IIRR_SECRETARY:    1,
  DELEGATE:          1,
  USER:              0,
}

export function getRoleRank(role: Role): number {
  return ROLE_RANK[role] ?? 0
}

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

export function canManageEvents(role: Role): boolean {
  const auth = getAuthority(role)
  return auth === RoleAuthority.EXECUTIVE || auth === RoleAuthority.PRESS
}

export function canManagePosts(role: Role): boolean {
  const auth = getAuthority(role)
  return auth === RoleAuthority.EXECUTIVE || auth === RoleAuthority.PRESS
}
