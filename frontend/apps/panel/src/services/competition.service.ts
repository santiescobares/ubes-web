import api from '@/lib/axios'
import type {
  CompetitionDTO,
  CompetitionCreateDTO,
  CompetitionUpdateDTO,
  ParticipantDTO,
  ParticipantCreateDTO,
  ParticipantUpdateDTO,
  ResultDTO,
  ResultCreateDTO,
  ResultUpdateDTO,
  ParticipantPositionType,
} from '@ubes/types'

interface Page<T> {
  content: T[]
  totalPages: number
  totalElements: number
  number: number
  size: number
}

export class CompetitionService {
  static async getCompetitions(page = 0, size = 9): Promise<Page<CompetitionDTO>> {
    const { data } = await api.get<Page<CompetitionDTO>>('/competitions', {
      params: { page, size },
    })
    return data
  }

  static async getCompetition(id: string): Promise<CompetitionDTO> {
    const { data } = await api.get<CompetitionDTO>(`/competitions/${id}`)
    return data
  }

  static async createCompetition(
    dto: CompetitionCreateDTO,
    bannerFile?: File,
    regulationDocumentFile?: File,
  ): Promise<CompetitionDTO> {
    const form = new FormData()
    form.append('body', new Blob([JSON.stringify(dto)], { type: 'application/json' }))
    if (bannerFile) form.append('bannerFile', bannerFile)
    if (regulationDocumentFile) form.append('regulationDocumentFile', regulationDocumentFile)
    const { data } = await api.post<CompetitionDTO>('/competitions', form)
    return data
  }

  static async updateCompetition(
    id: string,
    dto: CompetitionUpdateDTO,
    bannerFile?: File,
    removeBanner?: boolean,
    regulationDocumentFile?: File,
    removeRegulationDocument?: boolean,
  ): Promise<CompetitionDTO> {
    const form = new FormData()
    form.append('body', new Blob([JSON.stringify(dto)], { type: 'application/json' }))
    if (bannerFile) form.append('bannerFile', bannerFile)
    if (removeBanner) form.append('removeBanner', 'true')
    if (regulationDocumentFile) form.append('regulationDocumentFile', regulationDocumentFile)
    if (removeRegulationDocument) form.append('removeRegulationDocument', 'true')
    const { data } = await api.put<CompetitionDTO>(`/competitions/${id}`, form)
    return data
  }

  static async deleteCompetition(id: string): Promise<void> {
    await api.delete(`/competitions/${id}`)
  }

  static async scheduleRegistration(id: string, startingDate: string, endingDate: string): Promise<CompetitionDTO> {
    const { data } = await api.patch<CompetitionDTO>(`/competitions/${id}/schedule-registration`, null, {
      params: { startingDate, endingDate },
    })
    return data
  }

  static async openRegistration(id: string): Promise<void> {
    await api.patch(`/competitions/${id}/open-registration`)
  }

  static async closeRegistration(id: string, cancel = false): Promise<void> {
    await api.patch(`/competitions/${id}/close-registration`, null, { params: { cancel } })
  }

  static async startCompetition(id: string): Promise<void> {
    await api.patch(`/competitions/${id}/start`)
  }

  static async endCompetition(id: string): Promise<void> {
    await api.patch(`/competitions/${id}/end`)
  }

  static async cancelCompetition(id: string): Promise<CompetitionDTO> {
    const { data } = await api.patch<CompetitionDTO>(`/competitions/${id}/cancel`)
    return data
  }
}

export class ParticipantService {
  static async getParticipants(competitionId: string, page = 0, size = 20, search?: string): Promise<Page<ParticipantDTO>> {
    const { data } = await api.get<Page<ParticipantDTO>>('/competitions/participants', {
      params: { competitionId, page, size, sort: 'createdAt,desc', ...(search ? { search } : {}) },
    })
    return data
  }

  static async addParticipants(
    competitionId: string,
    participants: ParticipantCreateDTO[],
    studentCertificateFiles?: File[],
    medicalCertificateFiles?: File[],
  ): Promise<void> {
    const form = new FormData()
    form.append('competitionId', competitionId)
    form.append('participants', new Blob([JSON.stringify(participants)], { type: 'application/json' }))
    studentCertificateFiles?.forEach(f => form.append('studentCertificateFiles', f))
    medicalCertificateFiles?.forEach(f => form.append('medicalCertificateFiles', f))
    await api.post('/competitions/participants', form)
  }

  static async updateParticipant(
    id: string,
    dto: ParticipantUpdateDTO,
    studentCertificateFile?: File,
    removeStudentCertificate?: boolean,
    medicalCertificateFile?: File,
    removeMedicalCertificate?: boolean,
  ): Promise<ParticipantDTO> {
    const form = new FormData()
    form.append('body', new Blob([JSON.stringify(dto)], { type: 'application/json' }))
    if (studentCertificateFile) form.append('studentCertificateFile', studentCertificateFile)
    if (removeStudentCertificate) form.append('removeStudentCertificate', 'true')
    if (medicalCertificateFile) form.append('medicalCertificateFile', medicalCertificateFile)
    if (removeMedicalCertificate) form.append('removeMedicalCertificate', 'true')
    const { data } = await api.put<ParticipantDTO>(`/competitions/participants/${id}`, form)
    return data
  }

  static async deleteParticipant(id: string): Promise<void> {
    await api.delete(`/competitions/participants/${id}`)
  }
}

export class ResultService {
  static async getResults(competitionId: string): Promise<ResultDTO[]> {
    const { data } = await api.get<ResultDTO[]>(`/competitions/results/${competitionId}`)
    return data
  }

  static async calculateResults(competitionId: string, results: ResultCreateDTO[]): Promise<void> {
    await api.post(`/competitions/results/${competitionId}`, results)
  }

  static async updateResult(
    competitionId: string,
    positionType: ParticipantPositionType,
    positionNumber: number,
    dto: ResultUpdateDTO,
  ): Promise<void> {
    await api.put(`/competitions/results/${competitionId}/${positionType}/${positionNumber}`, dto)
  }
}
