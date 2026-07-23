import { Mail } from 'lucide-react'
import { Button, Input } from '@finance/ui-kit'
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

  const codeError = errors.code?.message || (verifyMutation.isError ? 'Неверный код или он устарел' : undefined)

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <Mail size={24} />
      </div>
      <h2 className={styles.title}>Подтверждение почты</h2>
      <p className={styles.description}>
        Мы отправили 6-значный код на
        <strong className={styles.emailBlock}>{email}</strong>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <Input
          data-test-id="code-input"
          type="text"
          placeholder="123456"
          maxLength={6}
          autoComplete="one-time-code"
          error={codeError}
          {...register('code')}
          className={styles.codeInput}
        />

        <Button
          data-test-id="send-code-btn"
          type="submit"
          isLoading={verifyMutation.isPending}
          className={styles.submitBtn}
        >
          Подтвердить
        </Button>
      </form>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendMutation.isPending}
          className={styles.resendBtn}
        >
          Отправить код ещё раз
        </button>
        {resendStatus && <span className={styles.success}>{resendStatus}</span>}

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