import { test, expect } from '@playwright/test';
import { CategoriesPage } from './pages/CategoriesPage';
import { auth } from './helpers/auth';

test.describe('Управление категориями', () => {

  test('успешное создание и удаление категории', async ({ page }) => {
    const categoriesPage = new CategoriesPage(page);
    const categoryName = 'E2E Тест Бургеры';

    await auth(page);

    await categoriesPage.navigate();
    await expect(page).toHaveURL('/categories');

    await categoriesPage.createCategory(categoryName, '🍔');
    const card = categoriesPage.getCategoryCard(categoryName);
    await expect(card).toBeVisible();

    await categoriesPage.deleteCategory(categoryName);
    await expect(card).toBeHidden();
  });

});