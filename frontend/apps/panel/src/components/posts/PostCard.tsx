import type { PostDTO } from '@ubes/types'
import { formatDateTime } from '@/lib/dateUtils'

interface Props {
  post: PostDTO
  onClick?: () => void
}

function stripMarkdown(text: string): string {
  return text.replace(/[#*_>\[\]()\-`~]/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function PostCard({ post, onClick }: Props) {
  const { createdBy } = post
  const initials = (createdBy.firstName[0] + createdBy.lastName[0]).toUpperCase()
  const preview = stripMarkdown(post.body)

  return (
    <div
      className={`post-card${onClick ? ' clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? e => e.key === 'Enter' && onClick() : undefined}
    >
      <span className="post-card-title">{post.title}</span>
      <p className="post-card-body-preview">{preview}</p>
      <div className="post-card-footer">
        {createdBy.pictureURL ? (
          <img className="post-avatar" src={createdBy.pictureURL} alt={createdBy.firstName} />
        ) : (
          <div className="post-avatar-fallback">{initials}</div>
        )}
        <span>Publicado por {createdBy.firstName} {createdBy.lastName} el {formatDateTime(post.createdAt)}</span>
      </div>
    </div>
  )
}
