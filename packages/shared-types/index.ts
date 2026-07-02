export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: 'income' | 'expense' | 'both',
}

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  description: string
  categoryId: string
  date: string
  createdAt: string
  category: Category
}

export type CreateTransactionDto = Omit<Transaction, 'id' | 'createdAt' | 'category'>

export interface UserDto {
  id: string
  email: string
  isVerified: boolean
  avatarUrl: string | null
}
export interface AuthResponse {
  user: UserDto
}
export interface LoginDto {
  email: string
  password: string
}