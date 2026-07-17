import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/shared/lib/test-utils'
import { RegisterForm } from './RegisterForm'
import { ROUTES } from '@/shared/config'
import { useRegister } from '../../api/useRegister'

// подменяем реальное апи
vi.mock('../../api/useRegister', () => ({
  useRegister: vi.fn()
}))


describe('Компонент RegisterForm', () => {
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useRegister).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any)
  })

  it('показывает ошибки валидации Zod, если отправить пустую форму', async () => {
    const user = userEvent.setup()

    renderWithProviders(<RegisterForm />, { route: ROUTES.REGISTER })

    const submitBtn = screen.getByRole('button', { name: 'Регистрация' })
    await user.click(submitBtn)

    // ошибки Zod
    expect(await screen.findByText('Обязательное поле')).toBeInTheDocument()
    expect(await screen.findByText('Пароль должен быть не короче 6 символов')).toBeInTheDocument()

    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('блокирует кнопку и показывает загрузку, когда отправляется запрос', () => {
    vi.mocked(useRegister).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as any)

    renderWithProviders(<RegisterForm />, { route: ROUTES.LOGIN })

    const submitBtn = screen.getByRole('button', { name: /загрузка/i })

    expect(submitBtn).toBeDisabled()
  })

  it('отправляет правильные данные на бэкенд при успешной регистрации', async () => {
    const user = userEvent.setup()

    renderWithProviders(<RegisterForm />, { route: ROUTES.REGISTER })

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Пароль')
    const submitBtn = screen.getByRole('button', { name: 'Регистрация' })

    await user.type(emailInput, 'register@mail.ru')
    await user.type(passwordInput, '654321')
    await user.click(submitBtn)


    expect(mockMutate).toHaveBeenCalledTimes(1)
    expect(mockMutate).toHaveBeenCalledWith(
      {
        email: 'register@mail.ru',
        password: '654321'
      },
      expect.any(Object)
    )
  })

  it('показывает ошибку с бэкенда, если такой email уже занят', async () => {
    const user = userEvent.setup()

    const mockMutateWithError = vi.fn().mockImplementation((_data, options) => {
      if (options?.onError) {
        options.onError({
          response: { data: { error: "Пользователь с таким email уже существует" } }
        })
      }
    })

    vi.mocked(useRegister).mockReturnValue({
      mutate: mockMutateWithError,
      isPending: false,
    } as any)

    renderWithProviders(<RegisterForm />, { route: ROUTES.REGISTER })

    await user.type(screen.getByLabelText('Email'), 'existing@mail.ru')
    await user.type(screen.getByLabelText('Пароль'), '123456')
    await user.click(screen.getByRole('button', { name: 'Регистрация' }))

    expect(await screen.findByText('Пользователь с таким email уже существует')).toBeInTheDocument()
  })

})