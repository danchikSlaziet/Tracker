import { Button, Input } from '@/shared/ui'
import styles from './RegisterForm.module.css'
import { useRegisterForm } from './useRegisterForm'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'

export function RegisterForm() {
  const { form, onSubmit, isPending } = useRegisterForm()
  const { register, formState: { errors } } = form
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <h2 className={styles.title}>Регистрация аккаунта</h2>
      <Input
        id="email"
        type="email"
        label="Email"
        placeholder="name@example.com"
        error={errors.email?.message}
        data-test-id="email-input"
        {...register('email')} /* отдаст onChange, onBlur, ref и name */
      />
      <Input
        id="password"
        type="password"
        label="Пароль"
        placeholder="••••••"
        error={errors.password?.message}
        data-test-id="password-input"
        {...register('password')}
      />

      {errors.root && (
        <p className={styles.rootError}>{errors.root.message}</p>
      )}

      <Button type="submit" isLoading={isPending} className={styles.submitBtn} data-test-id="register-submit-btn">
        Регистрация
      </Button>
      <div className={styles.footerText}>
        Уже есть аккаунт? <Link to={ROUTES.LOGIN} className={styles.link}>Войти</Link>
      </div>
    </form>
  )
}