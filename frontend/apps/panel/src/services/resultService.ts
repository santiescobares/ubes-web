import api from '@/lib/axios'
import type { ResultDTO, ResultCreateDTO, ResultUpdateDTO, ResultOrderEntry } from '@ubes/types'
import type { ParticipantPositionType } from '@ubes/types'

const resultService = {
  getAll(competitionId: string): Promise<ResultDTO[]> {
    return api.get(`/competitions/${competitionId}/results`).then((r) => r.data)
  },

  getByType(competitionId: string, type: ParticipantPositionType): Promise<ResultDTO[]> {
    return api.get(`/competitions/${competitionId}/results/${type}`).then((r) => r.data)
  },

  add(competitionId: string, dto: ResultCreateDTO): Promise<ResultDTO> {
    return api.post(`/competitions/${competitionId}/results`, dto).then((r) => r.data)
  },

  update(competitionId: string, resultId: string, dto: ResultUpdateDTO): Promise<ResultDTO> {
    return api.put(`/competitions/${competitionId}/results/${resultId}`, dto).then((r) => r.data)
  },

  delete(competitionId: string, resultId: string): Promise<void> {
    return api.delete(`/competitions/${competitionId}/results/${resultId}`).then(() => {})
  },

  reorder(
    competitionId: string,
    type: ParticipantPositionType,
    entries: ResultOrderEntry[],
  ): Promise<void> {
    return api
      .put(`/competitions/${competitionId}/results/${type}/reorder`, { entries })
      .then(() => {})
  },
}

export default resultService
