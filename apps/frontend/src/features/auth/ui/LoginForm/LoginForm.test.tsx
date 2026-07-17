import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/shared/lib/test-utils'
import { LoginForm } from './LoginForm'
import { ROUTES } from '@/shared/config'
import { useLogin } from '../../api/useLogin'

// замочили хук
vi.mock('../../api/useLogin', () => ({
  useLogin: vi.fn()
}))

describe('Компонент LoginForm', () => {
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks() // очищаем историю

    vi.mocked(useLogin).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any)
  })

  it('показывает ошибки валидации Zod, если отправить пустую форму', async () => {
    const user = userEvent.setup()

    renderWithProviders(<LoginForm />, { route: ROUTES.LOGIN })

    const submitBtn = screen.getByRole('button', { name: 'Войти' })
    await user.click(submitBtn)

    // используем findByText (с ожиданием), а не getByText, т.к. асинхронщина у валидации RHF
    expect(await screen.findByText('Обязательное поле')).toBeInTheDocument()
    expect(await screen.findByText('Пароль должен быть не короче 6 символов')).toBeInTheDocument()

    // Убеждаемся, что запрос на бэкенд не ушел
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('блокирует кнопку и показывает загрузку, когда отправляется запрос', () => {
    vi.mocked(useLogin).mockReturnValue({
      mutate: mockMutate,
      isPending: true, 
    } as any)

    renderWithProviders(<LoginForm />, { route: ROUTES.LOGIN })

    const submitBtn = screen.getByRole('button', { name: /загрузка/i })
    
    expect(submitBtn).toBeDisabled()
  })


  it('показывает ошибку при вводе невалидного email', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />, { route: ROUTES.LOGIN })

    const emailInput = screen.getByLabelText('Email')
    const submitBtn = screen.getByRole('button', { name: 'Войти' })

    await user.type(emailInput, 'email@m')
    await user.click(submitBtn)

    expect(await screen.findByText('Некорректный формат email')).toBeInTheDocument()
  })

  it('показывает ошибку при вводе некорректного пароля или логина', async () => {
    const user = userEvent.setup()

    const mockMutateWithError = vi.fn().mockImplementation((_data, options) => {
      if (options?.onError) {
        options.onError({
          response: { data: { error: "Неверный email или пароль" } }
        })
      }
    })

    vi.mocked(useLogin).mockReturnValue({
      mutate: mockMutateWithError,
      isPending: false,
    } as any)

    renderWithProviders(<LoginForm />, { route: ROUTES.LOGIN })

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Пароль')
    const submitBtn = screen.getByRole('button', { name: 'Войти' })

    await user.type(emailInput, 'name@example.cOm')
    await user.type(passwordInput, '123456')
    await user.click(submitBtn)

    expect(await screen.findByText('Неверный email или пароль')).toBeInTheDocument()
  })


  it('отправляет правильные данные на хук при успешном заполнении', async () => {
    const user = userEvent.setup()

    // сработает дефолтный мок из beforeEach
    renderWithProviders(<LoginForm />, { route: ROUTES.LOGIN })
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Пароль')
    const submitBtn = screen.getByRole('button', { name: 'Войти' })
    await user.type(emailInput, 'name@example.com')
    await user.type(passwordInput, '123456')
    await user.click(submitBtn)

    expect(mockMutate).toHaveBeenCalledTimes(1)
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'name@example.com',
        password: '123456'
      }),
      expect.any(Object)
    )
  })
})