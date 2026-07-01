import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDeleteTransaction, useTransactions, useUpdateTransactions } from "../../api/useTransactions";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/dom";
import { renderWithProviders } from "@/shared/lib/test-utils";
import { TransactionList } from "./TransactionList";
import { ROUTES } from "@/shared/config/routes";

vi.mock('../../api/useTransactions', () => ({
  useDeleteTransaction: vi.fn(),
  useTransactions: vi.fn(),
  useUpdateTransactions: vi.fn(),
}));

describe('Компонент TransactionList.test', () => {
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useUpdateTransactions).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)

    vi.mocked(useDeleteTransaction).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any)

    vi.mocked(useTransactions).mockReturnValue({
      data: [
        {
          id: "f39181a8-5715-44fa-901a-e2c538ce2c2f",
          type: "expense",
          amount: 159900,
          description: "кино",
          date: "2026-06-28T00:00:00.000Z",
          categoryId: "0a474299-18e5-4ada-9aa4-187c76297540",
          userId: "4ea915d8-8bcb-4cb3-9d24-3a351cb3ba23",
          createdAt: "2026-06-28T15:42:08.226Z",
          updatedAt: "2026-06-28T15:42:08.226Z",
          category: {
            id: "0a474299-18e5-4ada-9aa4-187c76297540",
            name: "Развлечения",
            icon: "🍿",
            color: "#8b5cf6",
            type: "expense",
            isDeleted: false,
            userId: "4ea915d8-8bcb-4cb3-9d24-3a351cb3ba23",
            createdAt: "2026-06-26T14:18:47.098Z"
          }
        },
      ],
      isLoading: false
    } as any)
  })

  it('Удаляет транзакцию', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TransactionList />, { route: ROUTES.TRANSACTIONS })

    const deleteBtn = screen.getByRole('button', { name: 'Удалить' })
    expect(deleteBtn).toBeInTheDocument()

    await user.click(deleteBtn)
    expect(mockMutate).toHaveBeenCalledTimes(1)
    expect(mockMutate).toHaveBeenCalledWith(
      "f39181a8-5715-44fa-901a-e2c538ce2c2f"
    )

  })
})