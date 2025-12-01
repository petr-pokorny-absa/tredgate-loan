import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'
import { texts } from '../helpers/texts'

/**
 * Page Object for Loan List Component
 */
export class LoanListPage extends BasePage {
  // Locators - atomic elements
  readonly listHeading: Locator
  readonly emptyStateMessage: Locator
  readonly loanTable: Locator
  readonly tableRows: Locator

  constructor(page: Page) {
    super(page)
    
    this.listHeading = page.getByRole('heading', { name: texts.list.heading })
    this.emptyStateMessage = page.locator('.empty-state p')
    this.loanTable = page.locator('.loan-list table')
    this.tableRows = page.locator('.loan-list tbody tr')
  }

  // Atomic actions

  /**
   * Get locator for a specific loan row by applicant name
   */
  getLoanRow(applicantName: string): Locator {
    return this.page.locator(`tbody tr:has-text("${applicantName}")`)
  }

  /**
   * Get approve button for a loan
   */
  getApproveButton(applicantName: string): Locator {
    return this.getLoanRow(applicantName).locator('button[title="Approve"]')
  }

  /**
   * Get reject button for a loan
   */
  getRejectButton(applicantName: string): Locator {
    return this.getLoanRow(applicantName).locator('button[title="Reject"]')
  }

  /**
   * Get auto-decide button for a loan
   */
  getAutoDecideButton(applicantName: string): Locator {
    return this.getLoanRow(applicantName).locator('button[title="Auto-decide"]')
  }

  /**
   * Get delete button for a loan
   */
  getDeleteButton(applicantName: string): Locator {
    return this.getLoanRow(applicantName).locator('button[title="Delete"]')
  }

  /**
   * Get status badge for a loan
   */
  getStatusBadge(applicantName: string): Locator {
    return this.getLoanRow(applicantName).locator('.status-badge')
  }

  /**
   * Get count of loan rows
   */
  async getLoanCount(): Promise<number> {
    return await this.tableRows.count()
  }

  /**
   * Click approve button for a loan
   */
  async clickApprove(applicantName: string) {
    await this.click(this.getApproveButton(applicantName))
  }

  /**
   * Click reject button for a loan
   */
  async clickReject(applicantName: string) {
    await this.click(this.getRejectButton(applicantName))
  }

  /**
   * Click auto-decide button for a loan
   */
  async clickAutoDecide(applicantName: string) {
    await this.click(this.getAutoDecideButton(applicantName))
  }

  /**
   * Click delete button for a loan
   */
  async clickDelete(applicantName: string) {
    await this.click(this.getDeleteButton(applicantName))
  }

  // Grouped actions with test.step

  /**
   * Verify empty state is displayed
   */
  async verifyEmptyState() {
    await expect(this.emptyStateMessage, 'Empty state message should be visible').toBeVisible()
    await expect(this.emptyStateMessage, `Empty state should show correct message`).toHaveText(texts.list.emptyState)
  }

  /**
   * Verify loan table is visible
   */
  async verifyTableIsVisible() {
    await expect(this.loanTable, 'Loan table should be visible').toBeVisible()
  }

  /**
   * Verify a loan appears in the list
   */
  async verifyLoanExists(applicantName: string) {
    const loanRow = this.getLoanRow(applicantName)
    await expect(loanRow, `Loan for ${applicantName} should be visible`).toBeVisible()
  }

  /**
   * Verify loan status
   */
  async verifyLoanStatus(applicantName: string, expectedStatus: string) {
    const statusBadge = this.getStatusBadge(applicantName)
    await expect(statusBadge, `Status badge should be visible for ${applicantName}`).toBeVisible()
    await expect(statusBadge, `Status should be "${expectedStatus}" for ${applicantName}`).toHaveText(expectedStatus)
  }

  /**
   * Verify action buttons are visible for pending loan
   */
  async verifyPendingActionButtons(applicantName: string) {
    await expect(this.getApproveButton(applicantName), `Approve button should be visible for ${applicantName}`).toBeVisible()
    await expect(this.getRejectButton(applicantName), `Reject button should be visible for ${applicantName}`).toBeVisible()
    await expect(this.getAutoDecideButton(applicantName), `Auto-decide button should be visible for ${applicantName}`).toBeVisible()
  }

  /**
   * Verify action buttons are not visible for non-pending loan
   */
  async verifyNoPendingActionButtons(applicantName: string) {
    await expect(this.getApproveButton(applicantName), `Approve button should not be visible for ${applicantName}`).not.toBeVisible()
    await expect(this.getRejectButton(applicantName), `Reject button should not be visible for ${applicantName}`).not.toBeVisible()
    await expect(this.getAutoDecideButton(applicantName), `Auto-decide button should not be visible for ${applicantName}`).not.toBeVisible()
  }

  /**
   * Verify loan count matches expected value
   */
  async verifyLoanCount(expectedCount: number) {
    const actualCount = await this.getLoanCount()
    expect(actualCount, `Should have ${expectedCount} loan(s) in the list`).toBe(expectedCount)
  }

  /**
   * Approve a loan and verify status change
   */
  async approveLoan(applicantName: string) {
    await this.clickApprove(applicantName)
    await this.verifyLoanStatus(applicantName, texts.status.approved)
  }

  /**
   * Reject a loan and verify status change
   */
  async rejectLoan(applicantName: string) {
    await this.clickReject(applicantName)
    await this.verifyLoanStatus(applicantName, texts.status.rejected)
  }

  /**
   * Auto-decide a loan and verify status change
   */
  async autoDecideLoan(applicantName: string, expectedStatus: string) {
    await this.clickAutoDecide(applicantName)
    await this.verifyLoanStatus(applicantName, expectedStatus)
  }
}
