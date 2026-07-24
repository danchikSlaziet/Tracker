import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/shared/lib/test-utils'

import { CategoriesWidget } from './CategoriesWidget'

import { getCategories, createCategory } from '@/entities/category'


vi.mock('@/entities/category/api/categoriesApi', () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  restoreCategory: vi.fn(),
}))

describe('Виджет CategoriesWidget', () => {
  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    })
  }

  const mockCategories = [
    {
      id: "3ebcc346-f619-4d8c-bca6-881dd7686782",
      name: "Переводы",
      icon: "💸",
      color: "#ec4899",
      type: "both",
      isDeleted: false,
      userId: "8927d548-4480-416e-ad26-c28597791462",
      createdAt: "2026-07-23T18:58:14.463Z"
    },
    {
      id: "546d1efd-78af-4348-961b-45b12484b208",
      name: "Продукты",
      icon: "🛒",
      color: "#3b82f6",
      type: "expense",
      isDeleted: false,
      userId: "8927d548-4480-416e-ad26-c28597791462",
      createdAt: "2026-07-23T18:58:14.463Z"
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getCategories).mockResolvedValue(mockCategories as any)
    setWindowWidth(1024)
  })

  it('на десктопе заполняет боковую форму без открытия модалки', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CategoriesWidget />)

    await screen.findByText('Переводы')

    const editBtns = screen.getAllByTitle('Редактировать категорию')
    await user.click(editBtns[0])
    expect(screen.getByPlaceholderText('Например: Кафе')).toHaveValue(mockCategories[0].name)
    expect(screen.queryByTestId('category-modal')).not.toBeInTheDocument()
  })

  it('на мобильном устройстве открывает модальное окно при клике на редактирование', async () => {
    setWindowWidth(500)
    const user = userEvent.setup()
    renderWithProviders(<CategoriesWidget />)

    await screen.findByText('Переводы')
    const editBtns = screen.getAllByTitle('Редактировать категорию')
    await user.click(editBtns[0])

    expect(screen.getByTestId('category-modal')).toBeInTheDocument()
  })

  it('вызывает createCategory при отправке формы', async () => {
    vi.mocked(createCategory).mockResolvedValue({ id: 'cat-new' } as any)
    const user = userEvent.setup()
    renderWithProviders(<CategoriesWidget />)

    const input = screen.getByPlaceholderText('Например: Кафе')
    await user.type(input, 'Кафе')

    const submitBtn = screen.getByRole('button', { name: 'Создать' })
    await user.click(submitBtn)

    expect(createCategory).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Кафе' }),
      expect.anything()
    )
  })
})