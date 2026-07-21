import { useState, useRef, useEffect } from 'react'
import { useImportTransactions } from '../../api/useTransactions'
import styles from './ImportTransactionsForm.module.css'
import { socket } from '@/shared/lib/socket'
import { useImportProgress } from '../../model/useImportProgress'

import { useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/config'

const stageLabels: Record<string, string> = {
  reading_file: 'Читаем файл и категории...',
  sending_to_gemini: 'Отправляем в нейросеть...',
  analyzing: 'ИИ анализирует выписку...',
  parsing_data: 'Обрабатываем транзакции...',
  saving_database: 'Сохраняем в базу данных...',
  completed: 'Импорт завершен!',
  failed: 'Ошибка импорта',
}

export const ImportTransactionsForm = () => {
  const queryClient = useQueryClient()
  const { mutate: importFile, isPending, error, isSuccess, data, reset } = useImportTransactions()
  const [isDragActive, setIsDragActive] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { importProgress, setImportProgress } = useImportProgress()

  const activeStages = ['reading_file', 'sending_to_gemini', 'analyzing', 'parsing_data', 'saving_database']
  const isImporting = isPending || (importProgress !== null && activeStages.includes(importProgress.stage))


  useEffect(() => {
    socket.on('connect', () => {
      console.log('Фронтенд успешно подключился к сокету! ID:', socket.id)
    })

    socket.on('import:progress', (data) => {
      setImportProgress(data)
      // Если сокет сообщил, что импорт в базу успешно завершен — мгновенно обновляем списки
      if (data?.stage === 'completed') {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS })
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES })
      }
    })

    // при размонтировании формы стопаем соединение,
    return () => {
      socket.off('connect')
      socket.off('import:progress')
      console.log('Фронтенд отключился от сокета.')
    }
  }, [])



  const MAX_FILE_SIZE = 10 * 1024 * 1024

  const processFile = (file: File) => {
    setImportProgress(null)
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
      <p className={styles.subtitle}>
        Загрузите выписку любого банка — наш ИИ распознает транзакции и разложит по вашим категориям.
      </p>

      <div
        className={`${styles.dropzone} ${isDragActive ? styles.dragActive : ''} ${isImporting ? styles.disabled : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={!isImporting ? triggerFileInput : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className={styles.hiddenInput}
          onChange={handleFileChange}
          disabled={isImporting}
        />

        {isImporting ? (
          <div className={styles.loadingContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${importProgress?.percent ?? 0}%` }}
              />
            </div>
            <p className={styles.statusText}>
              {importProgress ? stageLabels[importProgress.stage] : 'Инициализация...'} {importProgress?.percent ?? 0}%
            </p>
            <p className={styles.loadingNote}>
              Не закрывайте страницу до окончания импорта
            </p>
          </div>

        ) : (isSuccess || importProgress?.stage === 'completed') ? (
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>🎉</div>
            <p className={styles.statusText}>Импорт завершен!</p>
            <p className={styles.successNote}>
              Успешно добавлено <strong>
                {importProgress?.importedCount ?? data?.importedCount}
              </strong> транзакций.
            </p>
            <button
              className={styles.resetBtn}
              onClick={(e) => {
                e.stopPropagation()
                reset()
                setImportProgress(null)
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
            setImportProgress(null)
          }}>✕</button>
        </div>
      )}
    </div>
  )
}