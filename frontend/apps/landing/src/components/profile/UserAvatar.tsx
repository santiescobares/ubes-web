import type { UserDTO } from '@ubes/types'

interface UserAvatarProps {
  pictureURL: UserDTO['pictureURL']
  firstName: string
  lastName: string
  size?: number
  className?: string
}

export default function UserAvatar({ pictureURL, firstName, lastName, size = 32, className }: UserAvatarProps) {
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()

  return (
    <div
      className={`user-avatar${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-label={`${firstName} ${lastName}`}
    >
      {pictureURL
        ? <img src={pictureURL} alt={`${firstName} ${lastName}`} />
        : initials
      }
    </div>
  )
}
