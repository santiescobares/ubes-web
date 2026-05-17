import { ThumbsUp, ThumbsDown } from 'lucide-react'
import type { SuggestionDTO } from '@ubes/types'

interface Props {
  suggestion: SuggestionDTO
}

export default function SuggestionCard({ suggestion }: Props) {
  const { createdBy, content, totalVotes, votesInFavor } = suggestion

  const initials = createdBy
    ? (createdBy.firstName[0] + createdBy.lastName[0]).toUpperCase()
    : '?'

  const authorName = createdBy
    ? `${createdBy.firstName} ${createdBy.lastName}`
    : 'Usuario anónimo'

  return (
    <div
      className="suggestion-card"
      onClick={() => window.open('/sugerencias', '_blank')}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && window.open('/sugerencias', '_blank')}
    >
      <div className="suggestion-card-header">
        {createdBy?.pictureURL ? (
          <img
            className="suggestion-card-avatar"
            src={createdBy.pictureURL}
            alt={createdBy.firstName}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="suggestion-card-avatar">{initials}</div>
        )}
        <span>Por {authorName}</span>
      </div>
      <p className="suggestion-card-body">{content}</p>
      <div className="suggestion-card-footer">
        <span className="suggestion-card-footer-item">
          <ThumbsUp size={12} />
          {votesInFavor}
        </span>
        <span className="suggestion-card-footer-item">
          <ThumbsDown size={12} />
          {totalVotes - votesInFavor}
        </span>
      </div>
    </div>
  )
}
