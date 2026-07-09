import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Компонент Button', () => {

  it('рендерит переданный текст', () => {
    render(<Button>Отправить</Button>)

    const button = screen.getByRole('button', { name: 'Отправить' })
    expect(button).toBeInTheDocument()
  })

  it('вызывает функцию onClick при клике', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Кликни меня</Button>)
    const button = screen.getByRole('button', { name: 'Кликни меня' })

    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('показывает текст "Загрузка..." и блокируется, если передан isLoading', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button isLoading={true} onClick={handleClick}>Отправить</Button>)

    const button = screen.getByRole('button', { name: 'Загрузка...' })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()

    await user.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })

})