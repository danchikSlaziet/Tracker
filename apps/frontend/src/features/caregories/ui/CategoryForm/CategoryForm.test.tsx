import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryForm } from './CategoryForm'

describe('Компонент CategoryForm', () => {

  it('рендерит форму создания по умолчанию', () => {
    render(<CategoryForm onSubmit={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Новая категория' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Создать' })).toBeInTheDocument()
  })

  it('рендерит форму редактирования с начальными данными', () => {
    const initialData = {
      name: 'Продукты',
      icon: '🍎',
      color: '#ff0000',
      type: 'expense' as const
    }

    render(<CategoryForm initialData={initialData} onSubmit={vi.fn()} />)


    expect(screen.getByRole('heading', { name: 'Редактировать категорию' })).toBeInTheDocument()

    expect(screen.getByLabelText('Название')).toHaveValue('Продукты')
    expect(screen.getByLabelText('Иконка (эмодзи)')).toHaveValue('🍎')
    expect(screen.getByLabelText('Тип')).toHaveValue('expense')

    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeInTheDocument()
  })

  it('показывает ошибку, если отправить форму с пустым названием', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(<CategoryForm onSubmit={handleSubmit} />)

    const submitBtn = screen.getByRole('button', { name: 'Создать' })
    await user.click(submitBtn)

    expect(await screen.findByText('Название обязательно')).toBeInTheDocument()
    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('показывает ошибку, если удалить дефолтную иконку и отправить форму', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(<CategoryForm onSubmit={handleSubmit} />)

    const submitBtn = screen.getByRole('button', { name: 'Создать' });
    const iconInput = screen.getByLabelText('Иконка (эмодзи)')
    await user.clear(iconInput)
    await user.click(submitBtn)


    expect(await screen.findByText('Иконка обязательна')).toBeInTheDocument()
    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('вызывает onSubmit с заполненными данными при успешной отправке', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(<CategoryForm onSubmit={handleSubmit} />)

    const nameInput = screen.getByLabelText('Название')
    const submitBtn = screen.getByRole('button', { name: 'Создать' })

    await user.type(nameInput, 'Зарплата')

    // Выбираем тип "Доход" из селекта
    const typeSelect = screen.getByLabelText('Тип')
    await user.selectOptions(typeSelect, 'income')

    await user.click(submitBtn)

    // Проверяем, что onSubmit вызвался с правильными данными
    expect(handleSubmit).toHaveBeenCalledTimes(1)
    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Зарплата',
      icon: '📦', // дефолтное значение
      color: '#3b82f6', // дефолтный цвет
      type: 'income'
    },
      expect.any(Object)
    )
  })

})