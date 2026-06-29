import { Locator, Page } from '@playwright/test';

interface TransactionFormValues {
  type: 'income' | 'expense';
  amount: string; // в проекте number
  category: string;
  description: string;
}

export class TransactionsPage {
  private readonly page: Page;

  readonly amountInput: Locator;
  readonly categorySelect: Locator;
  readonly descriptionInput: Locator;
  readonly saveButton: Locator;

  readonly searchInput: Locator;
  readonly typeFilterSelect: Locator;

  constructor(page: Page) {
    this.page = page;

    this.amountInput = page.getByTestId('amount-input');
    this.categorySelect = page.getByTestId('category-select');
    this.descriptionInput = page.getByTestId('description-input');
    this.saveButton = page.getByTestId('transaction-submit-btn');

    this.searchInput = page.getByTestId('search-input');
    this.typeFilterSelect = page.getByTestId('select-type-filter')
  }

  async navigate() {
    await this.page.goto('/transactions');
  }

  // переключение "Доход" / "Расход"
  async selectType(type: 'income' | 'expense') {
    const testId = type === 'income' ? 'type-income-radio' : 'type-expense-radio';
    await this.page.getByTestId(testId).check();
  }

  async fillForm(data: TransactionFormValues) {
    await this.selectType(data.type);
    await this.amountInput.fill(data.amount);
    await this.categorySelect.selectOption({ label: data.category });
    await this.descriptionInput.fill(data.description);
  }

  async submit() {
    await this.saveButton.click();
  }

  getTransactionCard(description: string): Locator {
    return this.page
      .getByTestId('transaction-item')
      .filter({ hasText: description });
  }

  async deleteTransaction(description: string) {
    const card = this.getTransactionCard(description);
    await card.getByTestId('delete-transaction-btn').click();
  }

  async search(text: string) {
    await this.searchInput.fill(text);
  }

  async filterByType(typeLabel: 'Все типы' | 'Доходы' | 'Расходы') {
    await this.typeFilterSelect.selectOption({ label: typeLabel });
  }

}