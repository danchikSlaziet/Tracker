import { Locator, Page } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.submitButton = page.getByTestId('login-submit-btn');
    this.errorMessage = page.locator('p');
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async fillForm({ email, password }: { email: string, password: string }) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }
}