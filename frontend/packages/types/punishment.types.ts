import type { UserSnapshotDTO } from './user.types'

export interface PunishmentDTO {
  id: string
  createdAt: string
  updatedAt: string
  issuedOn: UserSnapshotDTO
  issuedBy: UserSnapshotDTO
  reason: string
  expiresAt: string
  active: boolean
  removedAt: string | null
  removedBy: UserSnapshotDTO | null
  removeReason: string | null
}

export interface PunishmentCreateDTO {
  issuedOnId: string
  reason: string
  expiresAt: string
}

export interface PunishmentRemoveDTO {
  removeReason: string
}
