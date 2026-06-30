import { Locator, Page } from '@playwright/test';

export class VerifyPage {
  private readonly page: Page;

  readonly codeInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.codeInput = page.getByTestId('code-input');
    this.submitButton = page.getByTestId('send-code-btn');
  }

  async navigate() {
    await this.page.goto('/verify');
  }

  async fillForm(code: string) {
    await this.codeInput.fill(code);
  }

  async submit() {
    await this.submitButton.click();
  }
}