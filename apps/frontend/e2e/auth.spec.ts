import { test, expect } from '@playwright/test';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';

test.describe('Авторизация и Регистрация', () => {

  test('успешная регистрация и последующий вход в аккаунт', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);

    const uniqueEmail = `e2e-user-${crypto.randomUUID()}@test.com`;    // уникальный email, чтобы тесты не конфликтовали при параллельных/повторных запусках

    const password = 'super-secure-password';

    await registerPage.navigate();
    await registerPage.fillForm({ email: uniqueEmail, password });
    await registerPage.submit();

    await expect(page).toHaveURL('/login');

    await loginPage.fillForm({ email: uniqueEmail, password });
    await loginPage.submit();

    await expect(page).toHaveURL('/');

    await expect(page.getByRole('heading', { name: 'Дашборд' })).toBeVisible();
  });
});
