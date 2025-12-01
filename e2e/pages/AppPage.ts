import { Page } from '@playwright/test'
import { BasePage } from './BasePage'
import { LoanFormPage } from './LoanFormPage'
import { LoanListPage } from './LoanListPage'
import { LoanSummaryPage } from './LoanSummaryPage'
import { ConfirmModalPage } from './ConfirmModalPage'

/**
 * Main Application Page
 * Combines all page objects for easy access
 */
export class AppPage extends BasePage {
  readonly loanForm: LoanFormPage
  readonly loanList: LoanListPage
  readonly loanSummary: LoanSummaryPage
  readonly confirmModal: ConfirmModalPage

  constructor(page: Page) {
    super(page)
    
    this.loanForm = new LoanFormPage(page)
    this.loanList = new LoanListPage(page)
    this.loanSummary = new LoanSummaryPage(page)
    this.confirmModal = new ConfirmModalPage(page)
  }

  /**
   * Initialize the application with a clean state
   */
  async initialize() {
    await this.goto()
    await this.clearLocalStorage()
    await this.page.reload()
    await this.waitForPageLoad()
  }
}
