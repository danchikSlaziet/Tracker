import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/shared/lib/test-utils'
import { CategoryList } from './CategoryList'
import {
  useCategories,
  useRestoreCategory,
  useDeleteCategory,
} from '@/entities/category'


vi.mock('@/entities/category', () => ({
  useCategories: vi.fn(),
  useRestoreCategory: vi.fn(),
  useDeleteCategory: vi.fn()
}))

describe('Компонент CategoryList', () => {
  const mockDelete = vi.fn();
  const mockRestore = vi.fn();
  const mockOnEdit = vi.fn()

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
    vi.mocked(useDeleteCategory).mockReturnValue({ mutate: mockDelete } as any)
    vi.mocked(useRestoreCategory).mockReturnValue({ mutate: mockRestore } as any)
  })

  it('рендерит список активных категорий', () => {
    vi.mocked(useCategories).mockReturnValue({ data: mockCategories, isLoading: false } as any)

    renderWithProviders(<CategoryList onEdit={mockOnEdit} />)

    expect(screen.getByText('Переводы')).toBeInTheDocument()
    expect(screen.getByText('Продукты')).toBeInTheDocument()
  })

  it('вызывает onEdit при клике на кнопку редактирования', async () => {
    vi.mocked(useCategories).mockReturnValue({ data: mockCategories, isLoading: false } as any)
    const user = userEvent.setup()

    renderWithProviders(<CategoryList onEdit={mockOnEdit} />)

    const editBtns = screen.getAllByTitle('Редактировать категорию')
    await user.click(editBtns[0])
    expect(mockOnEdit).toHaveBeenCalledWith(mockCategories[0])
  })

  it('вызывает удаление категории при клике на корзину', async () => {
    vi.mocked(useCategories).mockReturnValue({ data: mockCategories, isLoading: false } as any)
    const user = userEvent.setup()

    renderWithProviders(<CategoryList onEdit={mockOnEdit} />)

    const deleteBtns = screen.getAllByTitle('Удалить категорию')
    await user.click(deleteBtns[0])
    expect(mockDelete).toHaveBeenCalledWith(mockCategories[0].id)
  })

  it('переключает список на удаленные категории при клике на чекбокс', async () => {
    vi.mocked(useCategories).mockReturnValue({ data: mockCategories, isLoading: false } as any)
    const user = userEvent.setup()

    renderWithProviders(<CategoryList onEdit={mockOnEdit} />)

    const checkbox = screen.getByRole('checkbox', { name: 'Показать удалённые категории' })
    await user.click(checkbox)
    expect(useCategories).toHaveBeenLastCalledWith({ onlyDeleted: true })

  })

  it('вызывает восстановление удаленной категории при клике на кнопку восстановить', async () => {
    const deletedCategory = [{ ...mockCategories[0], isDeleted: true }]
    vi.mocked(useCategories).mockReturnValue({ data: deletedCategory, isLoading: false } as any)
    const user = userEvent.setup()

    renderWithProviders(<CategoryList onEdit={mockOnEdit} />)

    const checkbox = screen.getByRole('checkbox', { name: 'Показать удалённые категории' })
    await user.click(checkbox)

    const restoreBtn = screen.getByRole('button', { name: 'Восстановить' })
    await user.click(restoreBtn)
    expect(mockRestore).toHaveBeenCalledWith(deletedCategory[0].id)
  })

})