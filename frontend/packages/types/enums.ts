export const Role = {
  DEVELOPER: 'DEVELOPER',
  PRESIDENT: 'PRESIDENT',
  VICE_PRESIDENT: 'VICE_PRESIDENT',
  SECRETARY: 'SECRETARY',
  SPORT_SECRETARY: 'SPORT_SECRETARY',
  CULTURE_SECRETARY: 'CULTURE_SECRETARY',
  PRESS_SECRETARY: 'PRESS_SECRETARY',
  ADMIN_SECRETARY: 'ADMIN_SECRETARY',
  IIRR_SECRETARY: 'IIRR_SECRETARY',
  CANTEEN_SECRETARY: 'CANTEEN_SECRETARY',
  DELEGATE: 'DELEGATE',
  USER: 'USER',
} as const
export type Role = (typeof Role)[keyof typeof Role]

export const RoleAuthority = {
  EXECUTIVE: 'EXECUTIVE',
  COMPETITION: 'COMPETITION',
  PRESS: 'PRESS',
  CANTEEN: 'CANTEEN',
  NONE: 'NONE',
} as const
export type RoleAuthority = (typeof RoleAuthority)[keyof typeof RoleAuthority]

export const School = {
  HUERTO: 'HUERTO',
  SAN_JOSE: 'SAN_JOSE',
  NORMAL: 'NORMAL',
  ENET: 'ENET',
  ENA: 'ENA',
  POLIVALENTE: 'POLIVALENTE',
  COMERCIAL: 'COMERCIAL',
  ROBERTINA: 'ROBERTINA',
  PROA: 'PROA',
  NACIONAL: 'NACIONAL',
  CENMA: 'CENMA',
  MONTESSORI: 'MONTESSORI',
} as const
export type School = (typeof School)[keyof typeof School]

export const EventType = {
  SPORT: 'SPORT',
  CULTURAL: 'CULTURAL',
  PARTY: 'PARTY',
  ASSEMBLY: 'ASSEMBLY',
  OTHER: 'OTHER',
} as const
export type EventType = (typeof EventType)[keyof typeof EventType]

export const CompetitionStatus = {
  SCHEDULED: 'SCHEDULED',
  ON_GOING: 'ON_GOING',
  FINISHED: 'FINISHED',
  CANCELED: 'CANCELED',
} as const
export type CompetitionStatus = (typeof CompetitionStatus)[keyof typeof CompetitionStatus]

export const RegistrationStatus = {
  UNAVAILABLE: 'UNAVAILABLE',
  SCHEDULED: 'SCHEDULED',
  AVAILABLE: 'AVAILABLE',
  EXPIRED: 'EXPIRED',
  CANCELED: 'CANCELED',
} as const
export type RegistrationStatus = (typeof RegistrationStatus)[keyof typeof RegistrationStatus]

export const ParticipantRole = {
  PARTICIPANT: 'PARTICIPANT',
  COACH: 'COACH',
} as const
export type ParticipantRole = (typeof ParticipantRole)[keyof typeof ParticipantRole]

export const ParticipantPositionType = {
  INDIVIDUAL: 'INDIVIDUAL',
  SCHOOL: 'SCHOOL',
  SUPPORTER: 'SUPPORTER',
} as const
export type ParticipantPositionType = (typeof ParticipantPositionType)[keyof typeof ParticipantPositionType]

export const IdType = {
  DNI: 'DNI',
  PASSPORT: 'PASSPORT',
} as const
export type IdType = (typeof IdType)[keyof typeof IdType]

export const DocumentType = {
  STATUTE: 'STATUTE',
  REGULATION: 'REGULATION',
  MINUTES: 'MINUTES',
  MEDICAL_CERTIFICATE: 'MEDICAL_CERTIFICATE',
  OTHER: 'OTHER',
} as const
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType]

export const FileType = {
  PDF: 'PDF',
  IMAGE: 'IMAGE',
  WORD: 'WORD',
  OTHER: 'OTHER',
} as const
export type FileType = (typeof FileType)[keyof typeof FileType]

export const ResourceType = {
  USER: 'USER',
  POST: 'POST',
  EVENT: 'EVENT',
  COMPETITION: 'COMPETITION',
  PARTICIPANT: 'PARTICIPANT',
  RESULT: 'RESULT',
  SUGGESTION: 'SUGGESTION',
  PUNISHMENT: 'PUNISHMENT',
  DOCUMENT: 'DOCUMENT',
} as const
export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType]

export const Action = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  STATE_CHANGE: 'STATE_CHANGE',
} as const
export type Action = (typeof Action)[keyof typeof Action]
