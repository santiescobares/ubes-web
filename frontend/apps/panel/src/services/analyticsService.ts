import api from '@/lib/axios'
import type { DashboardDataDTO } from '@ubes/types'

export default class AnalyticsService {
  static async getDashboard(): Promise<DashboardDataDTO> {
    const { data } = await api.get<DashboardDataDTO>('/analytics/dashboard')
    return data
  }
}
