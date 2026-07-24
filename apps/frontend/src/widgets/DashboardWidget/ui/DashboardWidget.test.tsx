import { getTransactions } from '@/features/transactions/'
import { renderWithProviders } from '@/shared/lib/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { DashboardWidget } from './DashboardWidget'

vi.mock('@/features/transactions/api/transactionsApi', () => ({
  getTransactions: vi.fn()
}))

describe('Виджет DashboardWidget', () => {
  const mockExpense = {
    "id": "f94e5cad-3fae-4a24-9bbe-b691316adda8",
    "type": "expense",
    "amount": 3213200,
    "description": "342",
    "date": "2026-07-24T00:00:00.000Z",
    "categoryId": "7375eea3-6427-4d1a-9042-2fee9ce76e6f",
    "userId": "8927d548-4480-416e-ad26-c28597791462",
    "createdAt": "2026-07-24T09:47:46.998Z",
    "updatedAt": "2026-07-24T09:47:46.998Z",
    "category": {
      "id": "7375eea3-6427-4d1a-9042-2fee9ce76e6f",
      "name": "Развлечения",
      "icon": "🍿",
      "color": "#8b5cf6",
      "type": "expense",
      "isDeleted": false,
      "userId": "8927d548-4480-416e-ad26-c28597791462",
      "createdAt": "2026-07-23T18:58:14.463Z"
    }
  }
  const mockIncome = {
    "id": "341fe253-f9fe-477d-918b-54c308c7c948",
    "type": "income",
    "amount": 22044000,
    "description": "агенство",
    "date": "2026-07-24T00:00:00.000Z",
    "categoryId": "59fa913b-6b60-4ad2-af49-549784213864",
    "userId": "8927d548-4480-416e-ad26-c28597791462",
    "createdAt": "2026-07-24T12:15:47.103Z",
    "updatedAt": "2026-07-24T12:15:47.103Z",
    "category": {
      "id": "59fa913b-6b60-4ad2-af49-549784213864",
      "name": "Зарплата",
      "icon": "💰",
      "color": "#10b981",
      "type": "income",
      "isDeleted": false,
      "userId": "8927d548-4480-416e-ad26-c28597791462",
      "createdAt": "2026-07-23T18:58:14.463Z"
    }
  }

  const mockTransactions = [mockExpense, mockIncome]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getTransactions).mockResolvedValue({
      data: mockTransactions,
      meta: { total: 2, page: 1, limit: 20, totalPages: 1 }
    } as any)
  })

  it('рассчитывает и выводит Баланс, Доходы и Расходы', async () => {
    renderWithProviders(<DashboardWidget />)

    await screen.findByText('агенство')

    expect(screen.getAllByText(/188 308/i)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/220 440/i)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/32 132/i)[0]).toBeInTheDocument()
  })

  it('выводит список последних транзакций', async () => {
    renderWithProviders(<DashboardWidget />)

    await screen.findByText('агенство')

    expect(screen.getByText('агенство')).toBeInTheDocument()
    expect(screen.getByText('342')).toBeInTheDocument()
  })

  it('содержит ссылку на страницу транзакций', async () => {
    renderWithProviders(<DashboardWidget />)

    const link = screen.getByRole('link', { name: /Все транзакции/i })
    expect(link).toHaveAttribute('href', '/transactions')
  })

})