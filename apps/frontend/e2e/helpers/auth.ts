import { expect, Page } from "@playwright/test";
import { RegisterPage } from "../pages/RegisterPage";
import { VerifyPage } from "../pages/VerifyPage";

export async function auth(page: Page) {
  const registerPage = new RegisterPage(page);
  const verifyPage = new VerifyPage(page)

  const uniqueEmail = `e2e-user-${crypto.randomUUID()}@test.com`;    // уникальный email, чтобы тесты не конфликтовали при параллельных/повторных запусках

  const password = 'super-secure-password';

  await registerPage.navigate();
  await registerPage.fillForm({ email: uniqueEmail, password });
  await registerPage.submit();

  await expect(page).toHaveURL('/verify');
  await verifyPage.fillForm('123456')
  await verifyPage.submit()

  await expect(page).toHaveURL('/');

  await expect(page.getByRole('heading', { name: 'Дашборд' })).toBeVisible();
}