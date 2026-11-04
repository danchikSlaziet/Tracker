import { Button, OtpInput } from '@finance/ui-kit'
import { useVerifyForm } from './useVerifyForm'
import styles from './VerifyForm.module.css'
import { Controller } from 'react-hook-form'

export const VerifyForm = () => {
  const {
    email,
    control,
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
      <h2 className={styles.title}>Подтверждение почты</h2>
      <p className={styles.description}>
        Мы отправили 6-значный код на
        <strong className={styles.emailBlock}>{email}</strong>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <Controller  // тк не можем повесить ref на 6 инпутов
          name="code"
          control={control}
          render={({ field }) => (
            <OtpInput
              id="code"
              testId="code-input"
              value={field.value}
              onChange={field.onChange}
              error={codeError}
              disabled={verifyMutation.isPending}
            />
          )}
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