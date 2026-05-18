import { useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { UserDTO } from '@ubes/types'
import UserAvatar from './UserAvatar'
import ProfilePictureCropModal from './ProfilePictureCropModal'
import useAuthStore from '@/store/authStore'
import { updateProfilePicture, deleteProfilePicture } from '@/services/userService'

const MAX_PICTURE_FILE_SIZE = 10 * 1024 * 1024

interface ProfilePictureBoxProps {
  user: UserDTO
  onUploadingChange?: (uploading: boolean) => void
}

export default function ProfilePictureBox({ user, onUploadingChange }: ProfilePictureBoxProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const updateUser = useAuthStore(s => s.updateUser)
  const [cropFile, setCropFile] = useState<File | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (file.size > MAX_PICTURE_FILE_SIZE) {
      toast.error('La imagen supera los 10 MB')
      return
    }

    setCropFile(file)
  }

  async function handleCropConfirm(blob: Blob) {
    setCropFile(null)
    const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' })
    onUploadingChange?.(true)
    try {
      const data = await updateProfilePicture(file)
      updateUser({ pictureURL: data.pictureURL })
      toast.success('Foto actualizada')
    } catch {
      toast.error('No pudimos actualizar la foto. Intentá de nuevo')
    } finally {
      onUploadingChange?.(false)
    }
  }

  async function handleDelete() {
    try {
      const data = await deleteProfilePicture()
      updateUser({ pictureURL: data.pictureURL })
      toast.success('Foto eliminada')
    } catch {
      toast.error('No pudimos eliminar la foto')
    }
  }

  return (
    <>
    {cropFile && (
      <ProfilePictureCropModal
        file={cropFile}
        onConfirm={handleCropConfirm}
        onCancel={() => setCropFile(null)}
      />
    )}
    <div className="profile-modal-picture">
      <div className="profile-modal-picture-wrap">
        <UserAvatar
          pictureURL={user.pictureURL}
          firstName={user.firstName}
          lastName={user.lastName}
          size={170}
        />
        {user.pictureURL && (
          <button
            type="button"
            className="profile-modal-picture-delete"
            onClick={handleDelete}
            aria-label="Eliminar foto"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        hidden
        onChange={handleFileChange}
      />
      <button
        type="button"
        className="btn btn-outline"
        style={{ fontSize: '15px', padding: '10px 12px', width: '100%', lineHeight: '1.4', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        onClick={() => fileRef.current?.click()}
      >
        Cambiar
      </button>
    </div>
    </>
  )
}
