import api from '@/lib/axios'
import type { PostDTO, PageResponse } from '@ubes/types'

export async function listPosts(params: { page?: number; size?: number } = {}): Promise<PageResponse<PostDTO>> {
  const { data } = await api.get<PageResponse<PostDTO>>('/posts', {
    params: { page: params.page ?? 0, size: params.size ?? 5, sort: 'createdAt,DESC' },
  })
  return data
}
