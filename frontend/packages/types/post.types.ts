import type { UserSnapshotDTO } from './user.types'

export interface PostDTO {
  id: string
  createdAt: string
  updatedAt: string
  createdBy: UserSnapshotDTO
  title: string
  body: string
  bannerURL: string | null
}

export interface PostCreateDTO {
  title: string
  body: string
}

export interface PostUpdateDTO {
  title?: string
  body?: string
}
