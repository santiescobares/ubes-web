import api from '@/lib/axios'
import type { Page } from '@/lib/types'
import type { CompetitionDTO, CompetitionCreateDTO, CompetitionUpdateDTO } from '@ubes/types'

function buildMultipartForm(body: object, files: Record<string, File | null | undefined>): FormData {
  const fd = new FormData()
  fd.append('body', new Blob([JSON.stringify(body)], { type: 'application/json' }))
  for (const [key, file] of Object.entries(files)) {
    if (file) fd.append(key, file)
  }
  return fd
}

const competitionService = {
  getAll(page = 0, size = 10): Promise<Page<CompetitionDTO>> {
    return api.get('/competitions', { params: { page, size } }).then((r) => r.data)
  },

  get(id: string): Promise<CompetitionDTO> {
    return api.get(`/competitions/${id}`).then((r) => r.data)
  },

  create(
    dto: CompetitionCreateDTO,
    bannerFile?: File,
    regulationDocumentFile?: File,
  ): Promise<CompetitionDTO> {
    const fd = buildMultipartForm(dto, { bannerFile, regulationDocumentFile })
    return api.post('/competitions', fd).then((r) => r.data)
  },

  update(
    id: string,
    dto: CompetitionUpdateDTO,
    bannerFile?: File | null,
    regulationDocumentFile?: File | null,
    removeBanner?: boolean,
    removeRegulationDocument?: boolean,
  ): Promise<CompetitionDTO> {
    const fd = buildMultipartForm(dto, { bannerFile, regulationDocumentFile })
    return api
      .put(`/competitions/${id}`, fd, {
        params: { removeBanner: removeBanner || undefined, removeRegulationDocument: removeRegulationDocument || undefined },
      })
      .then((r) => r.data)
  },

  delete(id: string): Promise<void> {
    return api.delete(`/competitions/${id}`).then(() => {})
  },

  scheduleRegistration(id: string, startingDate: string, endingDate: string): Promise<void> {
    return api
      .patch(`/competitions/${id}/schedule-registration`, null, { params: { startingDate, endingDate } })
      .then(() => {})
  },

  openRegistration(id: string): Promise<void> {
    return api.patch(`/competitions/${id}/open-registration`).then(() => {})
  },

  closeRegistration(id: string, cancel = false): Promise<void> {
    return api
      .patch(`/competitions/${id}/close-registration`, null, { params: { cancel } })
      .then(() => {})
  },

  start(id: string): Promise<void> {
    return api.patch(`/competitions/${id}/start`).then(() => {})
  },

  end(id: string): Promise<void> {
    return api.patch(`/competitions/${id}/end`).then(() => {})
  },

  cancel(id: string): Promise<void> {
    return api.patch(`/competitions/${id}/cancel`).then(() => {})
  },
}

export default competitionService
