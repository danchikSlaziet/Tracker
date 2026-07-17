import { useCategories } from '@/entities/category'
import { beforeEach, describe, vi } from 'vitest'
import { useCreateTransaction } from '../../api/useTransactions'
import { it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/shared/lib/test-utils'
import { ROUTES } from '@/shared/config'
import { CreateTransactionForm } from './CreateTransactionForm'



vi.mock('@/entities/category', () => ({
  useCategories: vi.fn()
}))
vi.mock('../../api/useTransactions', () => ({
  useCreateTransaction: vi.fn()
}))

describe('Компонент CreateTransactionForm', () => {
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useCreateTransaction).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any)
    vi.mocked(useCategories).mockReturnValue({
      data: [],
      isLoading: false
    } as any)
  })

  it('показывает ошибки с пустыми полями при отправке формы', async () => {
    const user = userEvent.setup()

    renderWithProviders(<CreateTransactionForm />, { route: ROUTES.TRANSACTIONS })

    const submitBtn = screen.getByRole('button', { name: 'Сохранить' })
    const dateInput = screen.getByLabelText('Дата')

    await user.clear(dateInput)
    await user.click(submitBtn)

    expect(screen.getByText('Введите сумму')).toBeInTheDocument()
    expect(screen.getAllByText('Выберите категорию')).toHaveLength(2)
    expect(screen.getByText('Описание обязательно')).toBeInTheDocument()
    expect(screen.getByText('Дата обязательна')).toBeInTheDocument()
  })

  it('успешно отправляет транзакцию', async () => {
    const user = userEvent.setup()

    vi.mocked(useCategories).mockReturnValue({ // mockReturnValue, а не mockResolvedValue - т.к. хук синхронный
      data: [
        { id: 'cat-1', name: 'Еда', icon: '🍔', type: 'expense' }
      ],
      isLoading: false
    } as any)

    renderWithProviders(<CreateTransactionForm />, { route: ROUTES.TRANSACTIONS })

    const amountInput = screen.getByLabelText('Сумма')
    const categorySelect = screen.getByLabelText('Категория')
    const descriptionInput = screen.getByLabelText('Описание')
    const submitBtn = screen.getByRole('button', { name: 'Сохранить' })

    await user.type(amountInput, '1500')
    await user.selectOptions(categorySelect, 'cat-1')
    await user.type(descriptionInput, 'Обед в кафе')

    await user.click(submitBtn)

    expect(mockMutate).toHaveBeenCalledTimes(1)


    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 1500,
        categoryId: 'cat-1',
        description: 'Обед в кафе',
        type: 'expense'
        // дату не проверяем, так как по дефолту сегодняшняя
      }),
      expect.any(Object) // всякая шляпа от танстака
    )
  })


})