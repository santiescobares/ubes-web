import type { DocumentType, FileType } from './enums'

export interface DocumentDTO {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  type: DocumentType
  fileType: FileType
  size: number
  url: string
}

export interface DocumentCreateDTO {
  name: string
  type: DocumentType
}

export interface DocumentUpdateDTO {
  name?: string
  type?: DocumentType
}
