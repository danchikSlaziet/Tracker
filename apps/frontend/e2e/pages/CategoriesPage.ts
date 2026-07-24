import { Locator, Page } from '@playwright/test';

export class CategoriesPage {
  private readonly page: Page;

  readonly nameInput: Locator;
  readonly iconInput: Locator;
  readonly submitButton: Locator;
  readonly openCreateBtn: Locator;


  constructor(page: Page) {
    this.page = page;
    this.openCreateBtn = page.getByTestId('open-create-category-btn');
    this.nameInput = page.locator('[data-test-id="category-name-input"]:visible');
    this.iconInput = page.locator('[data-test-id="category-icon-input"]:visible');
    this.submitButton = page.locator('[data-test-id="category-submit-btn"]:visible');
  }

  async navigate() {
    await this.page.goto('/categories');
    await this.page.waitForLoadState('networkidle');
  }

  async openCreateForm() {
    if (!await this.nameInput.isVisible()) {
      await this.openCreateBtn.click();  // только на мобилке
    }
  }

  async createCategory(name: string, icon = '🍔') {
    await this.openCreateForm();
    await this.nameInput.waitFor({ state: 'visible' });
    await this.nameInput.fill(name);
    await this.iconInput.fill(icon);
    await this.submitButton.click();
    await this.getCategoryCard(name).waitFor({ state: 'visible' });
  }

  async deleteCategory(name: string) {
    const card = this.getCategoryCard(name);
    await card.getByTestId('delete-category-btn').click();
  }

  getCategoryCard(name: string) {
    return this.page
      .getByTestId('category-item')
      .filter({ hasText: name });
  }
}