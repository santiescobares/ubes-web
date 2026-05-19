import { useRef, useEffect, useState } from 'react'
import { ThumbsUp, ThumbsDown, Clock, EyeOff } from 'lucide-react'
import type { SuggestionDTO } from '@ubes/types'
import SuggestionAvatar from './SuggestionAvatar'
import { formatPostTime } from '@/lib/dateUtils'

interface SuggestionCardProps {
  suggestion: SuggestionDTO
  isAuthority: boolean
  onOpen: (s: SuggestionDTO) => void
}

export default function SuggestionCard({ suggestion, isAuthority, onOpen }: SuggestionCardProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    const el = bodyRef.current
    if (el) setOverflows(el.scrollHeight > el.clientHeight + 1)
  }, [suggestion.content])

  const authorName = suggestion.createdBy
    ? `${suggestion.createdBy.firstName} ${suggestion.createdBy.lastName}`
    : 'Usuario Anónimo'

  const dislikes = suggestion.totalVotes - suggestion.votesInFavor

  const likeClass = suggestion.userVote === true
    ? 'suggestion-vote-count suggestion-vote-count--liked'
    : 'suggestion-vote-count'
  const dislikeClass = suggestion.userVote === false
    ? 'suggestion-vote-count suggestion-vote-count--disliked'
    : 'suggestion-vote-count'

  return (
    <div
      className="suggestion-card"
      onClick={() => onOpen(suggestion)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen(suggestion)}
    >
      <div className="suggestion-card-header">
        <SuggestionAvatar user={suggestion.createdBy} size={22} />
        <span>
          {authorName}
          {' '}•{' '}
          <Clock size={10} style={{ display: 'inline', verticalAlign: 'middle' }} />
          {' '}
          {formatPostTime(suggestion.createdAt)}
        </span>
      </div>

      <div ref={bodyRef} className={`suggestion-card-body${overflows ? ' overflows' : ''}`}>
        {suggestion.content}
      </div>

      <div className="suggestion-card-footer">
        <span className={likeClass}>
          <ThumbsUp size={12} fill={suggestion.userVote === true ? 'currentColor' : 'none'} />
          {suggestion.votesInFavor}
        </span>
        <span className={dislikeClass}>
          <ThumbsDown size={12} fill={suggestion.userVote === false ? 'currentColor' : 'none'} />
          {dislikes}
        </span>
        {suggestion.hidden && isAuthority && (
          <EyeOff size={12} style={{ marginLeft: 'auto', opacity: 0.45, flexShrink: 0 }} />
        )}
      </div>
    </div>
  )
}
