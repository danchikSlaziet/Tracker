import { useRef } from 'react'
import styles from './OtpInput.module.css'

interface OtpInputProps {
  length?: number
  value?: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  id?: string
  testId?: string
}

export function OtpInput({
  length = 6,
  value = '',
  onChange,
  error,
  disabled,
  id = 'otp',
  testId,
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length }, (_, index) => value[index] ?? '')

  const focusAt = (index: number) => {
    const input = inputsRef.current[index]
    input?.focus()
    input?.select()
  }

  const commit = (next: string[]) => {
    onChange(next.join('').slice(0, length))
  }

  const applyChars = (index: number, raw: string) => {
    const chars = raw.replace(/\D/g, '')
    if (!chars) return
    const firstEmpty = digits.findIndex((digit) => digit === '')
    const start = firstEmpty === -1 ? index : Math.min(index, firstEmpty)
    const next = [...digits]
    chars.split('').forEach((char, offset) => {
      if (start + offset < length) next[start + offset] = char
    })
    commit(next)
    focusAt(Math.min(start + chars.length, length - 1))
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.cells}>
        {digits.map((digit, index) => (
          <input
            key={index}
            id={index === 0 ? id : undefined}
            ref={(node) => { inputsRef.current[index] = node }}
            className={[styles.cell, error ? styles.cellError : ''].filter(Boolean).join(' ')}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`Цифра ${index + 1}`}
            data-test-id={index === 0 ? testId : undefined}
            maxLength={index === 0 ? length : 1}
            value={digit}
            disabled={disabled}
            onChange={(event) => {
              const raw = event.target.value
              if (!raw) {
                const next = [...digits]
                next[index] = ''
                commit(next)
                return
              }
              applyChars(index, raw)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && !digits[index] && index > 0) {
                event.preventDefault()
                const next = [...digits]
                next[index - 1] = ''
                commit(next)
                focusAt(index - 1)
              }
              if (event.key === 'ArrowLeft' && index > 0) {
                event.preventDefault()
                focusAt(index - 1)
              }
              if (event.key === 'ArrowRight' && index < length - 1) {
                event.preventDefault()
                focusAt(index + 1)
              }
            }}
            onPaste={(event) => {
              event.preventDefault()
              applyChars(index, event.clipboardData.getData('text'))
            }}
            onFocus={(event) => event.currentTarget.select()}
            onMouseDown={(event) => {
              const firstEmpty = digits.findIndex((digit) => digit === '')
              if (firstEmpty !== -1 && index > firstEmpty) {
                event.preventDefault()
                focusAt(firstEmpty)
              }
            }}
          />
        ))}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}