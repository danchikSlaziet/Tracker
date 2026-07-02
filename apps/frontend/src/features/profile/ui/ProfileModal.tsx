import React, { useRef, useState } from 'react'
import type { UserDto } from '@finance/shared-types'
import styles from './ProfileModal.module.css'
import { useDeleteAvatar, useUploadAvatar } from '../api/useAvatar'
import { Avatar } from '@/shared/ui/Avatar/Avatar'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserDto
}

export function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar()
  const { mutate: deleteAvatar, isPending: isDeleting } = useDeleteAvatar()

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // фронтовая валидация 
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение (JPEG, PNG, WEBP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла превышает 5 МБ')
      return
    }

    setError(null)
    uploadAvatar(file, {
      onError: (err: any) => {
        setError(err.response?.data?.error ?? 'Ошибка при загрузке аватара')
      }
    })
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setError(null)
    deleteAvatar(undefined, {
      onError: (err: any) => {
        setError(err.response?.data?.error ?? 'Ошибка при удалении аватара')
      }
    })
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
          &times;
        </button>

        <h2 className={styles.title}>Профиль пользователя</h2>

        <div className={styles.avatarSection}>
          <div
            className={[styles.avatarWrapper, isUploading ? styles.loading : ''].join(' ')}
            onClick={handleAvatarClick}
            title="Нажмите, чтобы изменить аватар"
          >
            <Avatar src={user.avatarUrl} email={user.email} size="lg" />
            <div className={styles.avatarHover}>
              <span>Сменить</span>
            </div>
            {isUploading && <div className={styles.loaderSpinner}>Загрузка...</div>}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            className={styles.fileInput}
          />

          {user.avatarUrl && (
            <button
              className={styles.deleteAvatarBtn}
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              {isDeleting ? 'Удаление...' : 'Удалить аватар'}
            </button>
          )}
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{user.email}</span>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  )
}