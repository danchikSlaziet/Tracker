import { test, expect } from '@playwright/test';
import { TransactionsPage } from './pages/TransactionsPage';
import { auth } from './helpers/auth';

test.describe('Управление транзакциями', () => {

  test('успешное создание и удаление транзакции', async ({ page }) => {
    const transactionPage = new TransactionsPage(page)
    const transactionDescription = 'E2E Тест Кино и Попкорн';
    await auth(page)

    await transactionPage.navigate()
    await expect(page).toHaveURL('/transactions')

    await transactionPage.fillForm({
      type: 'expense',
      amount: '350',
      category: '🍿 Развлечения',
      description: transactionDescription,
    });
    await transactionPage.submit();
    const transactionCard = transactionPage.getTransactionCard(transactionDescription);
    await expect(transactionCard).toBeVisible();

    await transactionPage.deleteTransaction(transactionDescription);
    await expect(transactionCard).toBeHidden();
  });

  test('успешная фильтрация и поиск транзакций', async ({ page }) => {
    const transactionPage = new TransactionsPage(page);

    await auth(page)

    await transactionPage.navigate();
    await transactionPage.fillForm({
      type: 'expense',
      amount: '500',
      category: '🍿 Развлечения',
      description: 'Купил пиццу',
    });
    await transactionPage.submit();


    await transactionPage.fillForm({
      type: 'income',
      amount: '5000',
      category: '💰 Зарплата',
      description: 'Зарплата за июнь',
    });
    await transactionPage.submit();

    const pizzaCard = transactionPage.getTransactionCard('Купил пиццу');
    const salaryCard = transactionPage.getTransactionCard('Зарплата за июнь');

    await expect(pizzaCard).toBeVisible();
    await expect(salaryCard).toBeVisible();

    await transactionPage.search('пиццу');

    await expect(pizzaCard).toBeVisible();
    await expect(salaryCard).toBeHidden();

    await transactionPage.search('');
    await expect(pizzaCard).toBeVisible();
    await expect(salaryCard).toBeVisible();

    await transactionPage.filterByType('Доходы');

    await expect(salaryCard).toBeVisible();
    await expect(pizzaCard).toBeHidden();
  });
});