import { useState, useRef } from 'react'
import { useImportTransactions } from '../../api/useTransactions'
import styles from './ImportTransactionsForm.module.css'

export const ImportTransactionsForm = () => {
  const { mutate: importFile, isPending, error, isSuccess, data, reset } = useImportTransactions()
  const [isDragActive, setIsDragActive] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 10 * 1024 * 1024

  const processFile = (file: File) => {
    setFileError(null) // сбрасываем предыдущую ошибку

    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      setFileError('Неверный формат файла. Поддерживаются только PDF-выписки.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('Файл слишком большой. Максимальный размер — 10 МБ.')
      return
    }
    importFile(file)
  }


  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = '' // сброс, чтобы повторный выбор того же файла работал
  }


  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const getErrorMessage = () => {
    if (!error) return null
    return (error as any)?.response?.data?.error || error.message || 'Произошла ошибка при импорте'
  }

  return (
    <div className={styles.container}>
      <h3>Импорт выписки банка (PDF)</h3>
      <h3>Для работы включите VPN!</h3>
      <p className={styles.subtitle}>
        Загрузите выписку любого банка — наш ИИ распознает транзакции и разложит по вашим категориям.
      </p>

      <div
        className={`${styles.dropzone} ${isDragActive ? styles.dragActive : ''} ${isPending ? styles.disabled : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={!isPending ? triggerFileInput : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className={styles.hiddenInput}
          onChange={handleFileChange}
          disabled={isPending}
        />

        {isPending ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.statusText}>ИИ анализирует выписку...</p>
            <p className={styles.loadingNote}>Это может занять 1-2 минуты для больших выписок (free api google gemini)</p>
          </div>
        ) : isSuccess ? (
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>🎉</div>
            <p className={styles.statusText}>Импорт завершен!</p>
            <p className={styles.successNote}>
              Успешно добавлено <strong>{data?.importedCount}</strong> транзакций.
            </p>
            <button
              className={styles.resetBtn}
              onClick={(e) => {
                e.stopPropagation()
                reset()
              }}
            >
              Загрузить еще одну
            </button>
          </div>
        ) : (
          <div className={styles.uploadPrompt}>
            <div className={styles.uploadIcon}>📄</div>
            <p className={styles.primaryText}>
              Перетащите выписку сюда или <strong>нажмите для выбора</strong>
            </p>
            <p className={styles.secondaryText}>Поддерживаются только PDF-файлы</p>
          </div>
        )}
      </div>

      {(error || fileError) && (
        <div className={styles.errorContainer}>
          <span className={styles.errorText}>
            {fileError || getErrorMessage()}
          </span>
          <button className={styles.errorClose} onClick={() => {
            reset()
            setFileError(null)
          }}>✕</button>
        </div>
      )}
    </div>
  )
}