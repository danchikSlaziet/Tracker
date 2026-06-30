import { useVerifyForm } from './useVerifyForm'
import styles from './VerifyForm.module.css'

export const VerifyForm = () => {
  const {
    email,
    register,
    handleSubmit,
    onSubmit,
    errors,
    verifyMutation,
    resendMutation,
    handleResend,
    resendStatus,
    handleLogout,
    isLoggingOut
  } = useVerifyForm()

  return (
    <div className={styles.container}>
      <h2>Подтверждение почты</h2>
      <p>Мы отправили 6-значный код на <strong>{email}</strong></p>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input
          data-test-id='code-input'
          type="text"
          placeholder="Введи код (6 цифр)"
          maxLength={6}
          {...register('code')}
          className={styles.input}
        />
        {errors.code && <span className={styles.error}>{errors.code.message}</span>}
        {verifyMutation.isError && <span className={styles.error}>Неверный код или он устарел</span>}

        <button data-test-id='send-code-btn' type="submit" disabled={verifyMutation.isPending} className={styles.submitBtn}>
          {verifyMutation.isPending ? 'Проверяем...' : 'Подтвердить'}
        </button>
      </form>

      <div className={styles.resendBlock}>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendMutation.isPending}
          className={styles.resendBtn}
        >
          Отправить код ещё раз
        </button>
        {resendStatus && <span className={styles.success}>{resendStatus}</span>}
      </div>
      <div className={styles.logoutBlock}>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={styles.logoutBtn}
        >
          Сменить аккаунт
        </button>
      </div>
    </div>
  )
}