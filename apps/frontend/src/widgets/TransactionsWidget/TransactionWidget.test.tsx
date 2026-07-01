import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/shared/lib/test-utils'
import { ROUTES } from '@/shared/config/routes'


import { getTransactions, createTransaction, deleteTransaction } from '@/features/transactions/api/transactionsApi'
import { getCategories } from '@/entities/category/api/categoriesApi'
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
    vi.mocked(getTransactions).mockResolvedValueOnce([])
    vi.mocked(getTransactions).mockResolvedValueOnce([newTransaction] as any)

    vi.mocked(createTransaction).mockResolvedValue(newTransaction as any)

    renderWithProviders(<TransactionWidget />, { route: ROUTES.TRANSACTIONS })

    const amountInput = await screen.findByLabelText('Сумма')
    const categorySelect = screen.getByLabelText('Категория')
    const descriptionInput = screen.getByLabelText('Описание')
    const submitBtn = screen.getByRole('button', { name: 'Сохранить' })

    await user.type(amountInput, '1500')
    await user.selectOptions(categorySelect, 'cat-1')
    await user.type(descriptionInput, 'Обед в кафе')

    await user.click(submitBtn)

    expect(descriptionInput).toHaveValue('')

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

    vi.mocked(getTransactions).mockResolvedValueOnce([oldTransaction] as any)
    vi.mocked(getTransactions).mockResolvedValueOnce([])

    vi.mocked(deleteTransaction).mockResolvedValue({ "message": "Транзакция удалена" })

    renderWithProviders(<TransactionWidget />, { route: ROUTES.TRANSACTIONS }) // рендер только после мока апишки

    const deleteBtn = await screen.findByText('Удалить') // getByText не подтянет - т.к. асинхронщина, а транзакции еще не подгрузились

    await user.click(deleteBtn)

    expect(screen.queryByText('Обед в кафе')).not.toBeInTheDocument()
  })
})