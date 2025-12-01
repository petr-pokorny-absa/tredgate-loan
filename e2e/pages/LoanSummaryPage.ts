import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'
import { texts } from '../helpers/texts'

/**
 * Page Object for Loan Summary Component
 */
export class LoanSummaryPage extends BasePage {
  // Locators - atomic elements
  readonly summaryContainer: Locator
  readonly totalApplicationsStat: Locator
  readonly pendingStat: Locator
  readonly approvedStat: Locator
  readonly rejectedStat: Locator
  readonly totalApprovedAmountStat: Locator

  constructor(page: Page) {
    super(page)
    
    this.summaryContainer = page.locator('.loan-summary')
    // Using more specific CSS class selectors to avoid ambiguity
    this.totalApplicationsStat = page.locator('.stat-card').filter({ has: page.locator('.stat-label', { hasText: texts.summary.total }) })
    this.pendingStat = page.locator('.stat-card.pending')
    this.approvedStat = page.locator('.stat-card.approved')
    this.rejectedStat = page.locator('.stat-card.rejected')
    this.totalApprovedAmountStat = page.locator('.stat-card.amount')
  }

  // Atomic actions

  /**
   * Get the value from a stat card
   */
  async getStatValue(statLocator: Locator): Promise<string> {
    const valueElement = statLocator.locator('.stat-value')
    return await this.getTextContent(valueElement)
  }

  /**
   * Get total applications count
   */
  async getTotalApplications(): Promise<number> {
    const value = await this.getStatValue(this.totalApplicationsStat)
    return parseInt(value, 10)
  }

  /**
   * Get pending count
   */
  async getPendingCount(): Promise<number> {
    const value = await this.getStatValue(this.pendingStat)
    return parseInt(value, 10)
  }

  /**
   * Get approved count
   */
  async getApprovedCount(): Promise<number> {
    const value = await this.getStatValue(this.approvedStat)
    return parseInt(value, 10)
  }

  /**
   * Get rejected count
   */
  async getRejectedCount(): Promise<number> {
    const value = await this.getStatValue(this.rejectedStat)
    return parseInt(value, 10)
  }

  /**
   * Get total approved amount as string (includes $ formatting)
   */
  async getTotalApprovedAmount(): Promise<string> {
    return await this.getStatValue(this.totalApprovedAmountStat)
  }

  // Grouped actions with test.step

  /**
   * Verify summary is visible
   */
  async verifySummaryIsVisible() {
    await expect(this.summaryContainer, 'Summary container should be visible').toBeVisible()
  }

  /**
   * Verify summary statistics match expected values
   */
  async verifySummaryStats(expected: {
    total: number
    pending: number
    approved: number
    rejected: number
  }) {
    const total = await this.getTotalApplications()
    const pending = await this.getPendingCount()
    const approved = await this.getApprovedCount()
    const rejected = await this.getRejectedCount()

    expect(total, `Total applications should be ${expected.total}`).toBe(expected.total)
    expect(pending, `Pending count should be ${expected.pending}`).toBe(expected.pending)
    expect(approved, `Approved count should be ${expected.approved}`).toBe(expected.approved)
    expect(rejected, `Rejected count should be ${expected.rejected}`).toBe(expected.rejected)
  }

  /**
   * Verify total approved amount
   */
  async verifyTotalApprovedAmount(expectedAmount: string) {
    const amount = await this.getTotalApprovedAmount()
    expect(amount, `Total approved amount should be ${expectedAmount}`).toBe(expectedAmount)
  }
}
