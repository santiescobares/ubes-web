import api from '@/lib/axios'
import type { DocumentCreateDTO, DocumentDTO, DocumentUpdateDTO } from '@ubes/types'

export interface DocumentListParams {
  id?: number
  name?: string
}

function buildFormData(dto: DocumentCreateDTO | DocumentUpdateDTO, file?: File | null): FormData {
  const fd = new FormData()
  fd.append('body', new Blob([JSON.stringify(dto)], { type: 'application/json' }))
  if (file) fd.append('file', file)
  return fd
}

export class DocumentService {
  static async list(params: DocumentListParams = {}): Promise<DocumentDTO[]> {
    const { data } = await api.get<DocumentDTO[]>('/documents', { params })
    return data
  }

  static async create(dto: DocumentCreateDTO, file: File): Promise<DocumentDTO> {
    const { data } = await api.post<DocumentDTO>('/documents', buildFormData(dto, file))
    return data
  }

  static async update(id: string | number, dto: DocumentUpdateDTO, file?: File | null): Promise<DocumentDTO> {
    const { data } = await api.put<DocumentDTO>(`/documents/${id}`, buildFormData(dto, file))
    return data
  }

  static async remove(id: string | number): Promise<void> {
    await api.delete(`/documents/${id}`)
  }
}

export default DocumentService
