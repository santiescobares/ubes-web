import api from '@/lib/axios'
import type { Page } from '@/lib/types'
import type { ParticipantDTO, ParticipantCreateDTO, ParticipantUpdateDTO } from '@ubes/types'

interface ParticipantListParams {
  page?: number
  size?: number
  search?: string
}

function buildParticipantForm(
  body: object,
  studentCertificateFile?: File,
  medicalCertificateFile?: File,
): FormData {
  const fd = new FormData()
  fd.append('body', new Blob([JSON.stringify(body)], { type: 'application/json' }))
  if (studentCertificateFile) fd.append('studentCertificateFile', studentCertificateFile)
  if (medicalCertificateFile) fd.append('medicalCertificateFile', medicalCertificateFile)
  return fd
}

const participantService = {
  getAll(competitionId: string, params?: ParticipantListParams): Promise<Page<ParticipantDTO>> {
    return api.get(`/competitions/${competitionId}/participants`, { params }).then((r) => r.data)
  },

  add(
    competitionId: string,
    dto: ParticipantCreateDTO,
    studentCertificateFile?: File,
    medicalCertificateFile?: File,
  ): Promise<ParticipantDTO> {
    const fd = buildParticipantForm(dto, studentCertificateFile, medicalCertificateFile)
    return api.post(`/competitions/${competitionId}/participants`, fd).then((r) => r.data)
  },

  addBulk(
    competitionId: string,
    dtos: ParticipantCreateDTO[],
    studentCertificateFiles?: File[],
    medicalCertificateFiles?: File[],
  ): Promise<void> {
    const fd = new FormData()
    fd.append('body', new Blob([JSON.stringify(dtos)], { type: 'application/json' }))
    studentCertificateFiles?.forEach((f) => fd.append('studentCertificateFiles', f))
    medicalCertificateFiles?.forEach((f) => fd.append('medicalCertificateFiles', f))
    return api.post(`/competitions/${competitionId}/participants/bulk`, fd).then(() => {})
  },

  update(
    competitionId: string,
    participantId: string,
    dto: ParticipantUpdateDTO,
    studentCertificateFile?: File,
    medicalCertificateFile?: File,
  ): Promise<ParticipantDTO> {
    const fd = buildParticipantForm(dto, studentCertificateFile, medicalCertificateFile)
    return api
      .put(`/competitions/${competitionId}/participants/${participantId}`, fd)
      .then((r) => r.data)
  },

  delete(competitionId: string, participantId: string): Promise<void> {
    return api.delete(`/competitions/${competitionId}/participants/${participantId}`).then(() => {})
  },
}

export default participantService
