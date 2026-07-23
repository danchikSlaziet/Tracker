import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/shared/lib/test-utils'
import { ROUTES } from '@/shared/config'

import { getTransactions, createTransaction, deleteTransaction } from '@/features/transactions'
import { getCategories } from '@/entities/category'
import { TransactionWidget } from './TransactionsWidget'

vi.mock('@/features/transactions/api/transactionsApi', () => ({
  getTransactions: vi.fn(),
  createTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
  importTransactions: vi.fn(),
}))

vi.mock('@/entities/category/api/categoriesApi', () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn()
}))

vi.mock('@/shared/lib/socket', () => ({
  socket: {
    on: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
  }
}))

vi.mock('@/shared/lib/useIntersectionObserver', () => ({
  useIntersectionObserver: vi.fn().mockReturnValue({ current: null })
}))

describe('Интеграционный тест: TransactionWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('создает транзакцию и сразу отображает её в списке', async () => {
    const user = userEvent.setup()

    // 1. Готовим моковые данные для "сервера"
    const mockCategory = { id: 'cat-1', name: 'Еда', icon: '🍔', type: 'expense', color: '#000' }
    const newTransaction = {
      id: 'trans-1',
      type: 'expense',
      amount: 1500,
      description: 'Обед в кафе',
      date: new Date().toISOString(),
      categoryId: 'cat-1',
      category: mockCategory
    }

    vi.mocked(getCategories).mockResolvedValue([mockCategory] as any)

    // Once дает выстроить очередь, без него сразу будет мочиться mockResolvedValueOnce([newTransaction] as any)
    vi.mocked(getTransactions).mockResolvedValueOnce({
      data: [],
      meta: { currentPage: 1, totalPages: 1, totalCount: 0, limit: 20 }
    } as any)

    vi.mocked(getTransactions).mockResolvedValueOnce({
      data: [newTransaction],
      meta: { currentPage: 1, totalPages: 1, totalCount: 1, limit: 20 }
    } as any)

    vi.mocked(createTransaction).mockResolvedValue(newTransaction as any)

    renderWithProviders(<TransactionWidget />, { route: ROUTES.TRANSACTIONS })

    // Открываем модальное окно создания транзакции
    const openModalBtn = await screen.findByRole('button', { name: 'Транзакция' })
    await user.click(openModalBtn)

    const amountInput = await screen.findByLabelText('Сумма')
    const categorySelect = screen.getByLabelText('Категория')
    const descriptionInput = screen.getByLabelText('Описание')
    const submitBtn = screen.getByRole('button', { name: 'Сохранить' })

    await user.type(amountInput, '1500')
    await user.selectOptions(categorySelect, 'cat-1')
    await user.type(descriptionInput, 'Обед в кафе')

    await user.click(submitBtn)

    expect(await screen.findByText('Обед в кафе')).toBeInTheDocument()
  })

  it('удаляет транзакцию и убирает ее из списка', async () => {
    const user = userEvent.setup()

    const mockCategory = { id: 'cat-1', name: 'Еда', icon: '🍔', type: 'expense', color: '#000' }
    const oldTransaction = {
      id: 'trans-1',
      type: 'expense',
      amount: 1500,
      description: 'Обед в кафе',
      date: new Date().toISOString(),
      categoryId: 'cat-1',
      category: mockCategory
    }

    vi.mocked(getCategories).mockResolvedValue([mockCategory] as any)

    vi.mocked(getTransactions).mockResolvedValueOnce({
      data: [oldTransaction],
      meta: { currentPage: 1, totalPages: 1, totalCount: 1, limit: 20 }
    } as any)
    vi.mocked(getTransactions).mockResolvedValueOnce({
      data: [],
      meta: { currentPage: 1, totalPages: 1, totalCount: 0, limit: 20 }
    } as any)

    vi.mocked(deleteTransaction).mockResolvedValue({ "message": "Транзакция удалена" } as any)

    renderWithProviders(<TransactionWidget />, { route: ROUTES.TRANSACTIONS })

    const deleteBtn = await screen.findByRole('button', { name: 'Удалить транзакцию' })

    await user.click(deleteBtn)

    expect(screen.queryByText('Обед в кафе')).not.toBeInTheDocument()
  })
})