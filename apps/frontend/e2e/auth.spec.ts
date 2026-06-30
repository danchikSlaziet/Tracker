import { test } from '@playwright/test';
import { auth } from './helpers/auth';

test.describe('Авторизация и Регистрация', () => {

  test('успешная регистрация, ввод otp-кода и последующий вход в аккаунт', async ({ page }) => {
    await auth(page)
  });
});
