import type { UserSnapshotDTO } from './user.types'

export interface PunishmentDTO {
  id: number
  createdAt: string
  updatedAt: string
  target: UserSnapshotDTO
  issuedBy: UserSnapshotDTO
  reason: string
  expiresAt: string | null
  active: boolean
  removedAt: string | null
  removedBy: UserSnapshotDTO | null
  removeReason: string | null
}

export interface PunishmentCreateDTO {
  targetId: string
  reason: string
  durationSeconds: number
}

export interface PunishmentRemoveDTO {
  reason: string
}
