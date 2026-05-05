import type { CompetitionStatus, IdType, ParticipantPositionType, ParticipantRole, RegistrationStatus, School } from './enums'
import type { DocumentDTO } from './document.types'
import type { LocationDTO } from './event.types'

export interface CompetitionDTO {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  description: string
  startingDate: string
  endingDate: string | null
  location: LocationDTO
  bannerURL: string | null
  regulationDocument: DocumentDTO | null
  minParticipants: number
  maxParticipants: number
  requiresShirtNumbers: boolean
  requiresMedicalCertificates: boolean
  registrationStartingDate: string | null
  registrationEndingDate: string | null
  registrationStatus: RegistrationStatus
  status: CompetitionStatus
}

export interface CompetitionCreateDTO {
  name: string
  description: string
  startingDate: string
  endingDate?: string
  location: LocationDTO
  minParticipants: number
  maxParticipants: number
  requiresShirtNumbers: boolean
  requiresMedicalCertificates: boolean
}

export interface CompetitionUpdateDTO {
  name?: string
  description?: string
  startingDate?: string
  endingDate?: string
  location?: LocationDTO
  minParticipants?: number
  maxParticipants?: number
  requiresShirtNumbers?: boolean
  requiresMedicalCertificates?: boolean
}

export interface ParticipantSnapshotDTO {
  id: string
  firstName: string
  lastName: string
  school: School
}

export interface ParticipantDTO {
  id: string
  createdAt: string
  updatedAt: string
  role: ParticipantRole
  firstName: string
  lastName: string
  idType: IdType
  idNumber: string
  school: School
  shirtNumber: number
}

export interface ParticipantCreateDTO {
  role: ParticipantRole
  firstName: string
  lastName: string
  idType: IdType
  idNumber: string
  school: School
  shirtNumber?: number
  competitionId: string
}

export interface ParticipantUpdateDTO {
  role?: ParticipantRole
  shirtNumber?: number
}

export interface ResultDTO {
  positionType: ParticipantPositionType
  positionNumber: number
  name: string
  points: number
  participant: ParticipantSnapshotDTO
}

export interface ResultCreateDTO {
  positionType: ParticipantPositionType
  positionNumber: number
  participantId: string
  points: number
}

export interface ResultUpdateDTO {
  points?: number
}
