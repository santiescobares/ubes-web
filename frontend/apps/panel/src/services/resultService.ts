import api from '@/lib/axios'
import type { ParticipantPositionType, ResultBulkUpsertDTO, ResultDTO } from '@ubes/types'

export class ResultService {
  static async list(
    competitionId: string | number,
    positionType?: ParticipantPositionType,
  ): Promise<ResultDTO[]> {
    const url = positionType
      ? `/competitions/${competitionId}/results/${positionType}`
      : `/competitions/${competitionId}/results`
    const { data } = await api.get<ResultDTO[]>(url)
    return data
  }

  static async bulkUpsert(
    competitionId: string | number,
    dto: ResultBulkUpsertDTO,
  ): Promise<ResultDTO[]> {
    const { data } = await api.post<ResultDTO[]>(
      `/competitions/${competitionId}/results/bulk`,
      dto,
    )
    return data
  }

  static async remove(
    competitionId: string | number,
    resultId: string | number,
  ): Promise<void> {
    await api.delete(`/competitions/${competitionId}/results/${resultId}`)
  }
}

export default ResultService
