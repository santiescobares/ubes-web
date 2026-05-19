import { User } from 'lucide-react'
import type { UserSnapshotDTO } from '@ubes/types'
import AuthorAvatar from '@/components/common/AuthorAvatar'

interface SuggestionAvatarProps {
  user: UserSnapshotDTO | null
  size?: number
}

export default function SuggestionAvatar({ user, size = 24 }: SuggestionAvatarProps) {
  if (user === null) {
    return (
      <div className="suggestion-anon-avatar" style={{ width: size, height: size }}>
        <User size={size * 0.55} strokeWidth={2.5} />
      </div>
    )
  }
  return <AuthorAvatar user={user} size={size} />
}
