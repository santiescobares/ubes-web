import api from '@/lib/axios'
import type { PostCreateDTO, PostDTO, PostUpdateDTO } from '@ubes/types'
import type { Page } from '@/lib/types'

export interface PostListParams {
  id?: number
  slug?: string
  page?: number
  size?: number
  sort?: string
}

function buildPostFormData(
  dto: PostCreateDTO | PostUpdateDTO,
  bannerFile?: File | null,
): FormData {
  const form = new FormData()
  form.append('body', new Blob([JSON.stringify(dto)], { type: 'application/json' }))
  if (bannerFile) form.append('bannerFile', bannerFile)
  return form
}

export class PostService {
  static async list(params: PostListParams = {}): Promise<Page<PostDTO>> {
    const { data } = await api.get<Page<PostDTO>>('/posts', { params })
    return data
  }

  static async create(dto: PostCreateDTO, bannerFile?: File | null): Promise<PostDTO> {
    const formData = buildPostFormData(dto, bannerFile)
    const { data } = await api.post<PostDTO>('/posts', formData)
    return data
  }

  static async update(
    id: string | number,
    dto: PostUpdateDTO,
    bannerFile?: File | null,
    removeBanner?: boolean,
  ): Promise<PostDTO> {
    const formData = buildPostFormData(dto, bannerFile)
    const params = removeBanner ? { removeBanner: true } : {}
    const { data } = await api.put<PostDTO>(`/posts/${id}`, formData, { params })
    return data
  }

  static async remove(id: string | number): Promise<void> {
    await api.delete(`/posts/${id}`)
  }
}

export default PostService
