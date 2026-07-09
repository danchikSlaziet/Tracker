
import styles from './Input.module.css'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}


export const Input = ({ label, error, className, id, ref, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> }) => {
  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={[styles.input, error ? styles.inputError : ''].filter(Boolean).join(' ')}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}