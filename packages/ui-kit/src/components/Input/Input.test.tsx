import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Компонент Input', () => {

  it('рендерит инпут с правильным label', () => {
    render(<Input label="Email" id="email" />)

    const input = screen.getByLabelText('Email')
    expect(input).toBeInTheDocument()
  })

  it('позволяет вводить текст', async () => {
    const user = userEvent.setup()

    render(<Input label="Имя" id="name" />)
    const input = screen.getByLabelText('Имя')

    // псевдо-юзер печатает текст
    await user.type(input, 'Иван')

    expect(input).toHaveValue('Иван')
  })

  it('показывает сообщение об ошибке, если передан error', () => {
    render(<Input label="Пароль" id="password" error="Слишком короткий пароль" />)

    const errorMessage = screen.getByText('Слишком короткий пароль')
    expect(errorMessage).toBeInTheDocument()
  })
})