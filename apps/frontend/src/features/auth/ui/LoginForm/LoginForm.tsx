import { Button, Input } from '@/shared/ui'
import styles from './LoginForm.module.css'
import { useLoginForm } from './useLoginForm'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { TelegramLoginButton } from '../TelegramLogin/TelegramLoginButton'

export function LoginForm() {
    const { form, onSubmit, isPending, onTelegramSuccess } = useLoginForm()
    const { register, formState: { errors } } = form
    return (
        <form className={styles.form} onSubmit={onSubmit}>
            <h2 className={styles.title}>Вход в аккаунт</h2>
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

            <Button type="submit" isLoading={isPending} className={styles.submitBtn} data-test-id="login-submit-btn">
                Войти
            </Button>
            <div className={styles.divider}>
                <span>или</span>
            </div>
            <TelegramLoginButton onAuth={onTelegramSuccess} />
            <div className={styles.footerText}>
                Нет аккаунта? <Link to={ROUTES.REGISTER} className={styles.link}>Зарегистрируйтесь</Link>
            </div>
        </form>
    )
}