import type { UserSnapshotDTO } from '@ubes/types'

interface AuthorAvatarProps {
  user: UserSnapshotDTO
  size?: number
}

export default function AuthorAvatar({ user, size = 28 }: AuthorAvatarProps) {
  const style = { width: size, height: size }

  if (user.pictureURL) {
    return (
      <img
        src={user.pictureURL}
        alt={`${user.firstName} ${user.lastName}`}
        className="author-avatar"
        style={style}
      />
    )
  }

  const initials = (user.firstName[0] + user.lastName[0]).toUpperCase()
  return (
    <div className="author-avatar-fallback" style={style}>
      {initials}
    </div>
  )
}
