import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'
import { texts } from '../helpers/texts'
import type { LoanTestData } from '../helpers/testData'

/**
 * Page Object for Loan Form Component
 */
export class LoanFormPage extends BasePage {
  // Locators - atomic elements
  readonly formHeading: Locator
  readonly applicantNameInput: Locator
  readonly amountInput: Locator
  readonly termMonthsInput: Locator
  readonly interestRateInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    super(page)
    
    // Using semantic selectors and fallback to stable attributes
    this.formHeading = page.getByRole('heading', { name: texts.form.heading })
    this.applicantNameInput = page.locator('#applicantName')
    this.amountInput = page.locator('#amount')
    this.termMonthsInput = page.locator('#termMonths')
    this.interestRateInput = page.locator('#interestRate')
    this.submitButton = page.getByRole('button', { name: texts.form.submitButton })
    this.errorMessage = page.locator('.error-message')
  }

  // Atomic actions

  /**
   * Fill applicant name field
   */
  async fillApplicantName(name: string) {
    await this.fillInput(this.applicantNameInput, name)
  }

  /**
   * Fill amount field
   */
  async fillAmount(amount: string) {
    await this.fillInput(this.amountInput, amount)
  }

  /**
   * Fill term months field
   */
  async fillTermMonths(term: string) {
    await this.fillInput(this.termMonthsInput, term)
  }

  /**
   * Fill interest rate field
   */
  async fillInterestRate(rate: string) {
    await this.fillInput(this.interestRateInput, rate)
  }

  /**
   * Click submit button
   */
  async clickSubmit() {
    await this.click(this.submitButton)
  }

  /**
   * Get error message text
   */
  async getErrorText(): Promise<string> {
    return await this.getTextContent(this.errorMessage)
  }

  /**
   * Check if error message is visible
   */
  async isErrorVisible(): Promise<boolean> {
    return await this.isVisible(this.errorMessage)
  }

  // Grouped actions with test.step

  /**
   * Create a loan application with provided data
   */
  async createLoanApplication(loanData: LoanTestData) {
    await this.fillApplicantName(loanData.applicantName)
    await this.fillAmount(loanData.amount.toString())
    await this.fillTermMonths(loanData.termMonths.toString())
    await this.fillInterestRate(loanData.interestRate.toString())
    await this.clickSubmit()
  }

  /**
   * Verify form is visible and ready
   */
  async verifyFormIsVisible() {
    await expect(this.formHeading, 'Form heading should be visible').toBeVisible()
    await expect(this.applicantNameInput, 'Applicant name input should be visible').toBeVisible()
    await expect(this.amountInput, 'Amount input should be visible').toBeVisible()
    await expect(this.termMonthsInput, 'Term months input should be visible').toBeVisible()
    await expect(this.interestRateInput, 'Interest rate input should be visible').toBeVisible()
    await expect(this.submitButton, 'Submit button should be visible').toBeVisible()
  }

  /**
   * Verify error message is displayed with expected text
   */
  async verifyErrorMessage(expectedMessage: string) {
    await expect(this.errorMessage, 'Error message should be visible').toBeVisible()
    await expect(this.errorMessage, `Error message should be "${expectedMessage}"`).toHaveText(expectedMessage)
  }

  /**
   * Verify form is cleared after submission
   */
  async verifyFormIsCleared() {
    await expect(this.applicantNameInput, 'Applicant name should be empty').toHaveValue('')
    await expect(this.amountInput, 'Amount should be empty').toHaveValue('')
    await expect(this.termMonthsInput, 'Term months should be empty').toHaveValue('')
    await expect(this.interestRateInput, 'Interest rate should be empty').toHaveValue('')
  }
}
