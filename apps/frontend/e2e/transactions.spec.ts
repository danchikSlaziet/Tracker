import { test, expect } from '@playwright/test';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { TransactionsPage } from './pages/TransactionsPage';

test.describe('Управление транзакциями', () => {

  test('успешное создание и удаление транзакции', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const transactionPage = new TransactionsPage(page)

    const uniqueEmail = `e2e-user-${crypto.randomUUID()}@test.com`;    // уникальный email, чтобы тесты не конфликтовали при параллельных/повторных запусках
    const password = 'super-secure-password';

    const transactionDescription = 'E2E Тест Кино и Попкорн';

    await registerPage.navigate();
    await registerPage.fillForm({ email: uniqueEmail, password });
    await registerPage.submit();

    await expect(page).toHaveURL('/login');
    await loginPage.fillForm({ email: uniqueEmail, password });
    await loginPage.submit();
    await expect(page).toHaveURL('/');

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
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const transactionPage = new TransactionsPage(page);

    const uniqueEmail = `e2e-user-${crypto.randomUUID()}@test.com`;
    const password = 'super-secure-password';

    await registerPage.navigate();
    await registerPage.fillForm({ email: uniqueEmail, password });
    await registerPage.submit();
    await expect(page).toHaveURL('/login');

    await loginPage.fillForm({ email: uniqueEmail, password });
    await loginPage.submit();
    await expect(page).toHaveURL('/');

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