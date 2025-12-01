import { test, expect } from '../fixtures/fixtures'
import { generateValidLoanData, formatCurrency } from '../helpers/testData'
import { texts } from '../helpers/texts'

test.describe('End-to-End Loan Management Workflow', () => {
  test('complete loan management workflow', async ({ appPage }) => {
    // Step 1: Verify initial empty state
    await test.step('Verify initial empty state', async () => {
      await appPage.loanForm.verifyFormIsVisible()
      await appPage.loanList.verifyEmptyState()
      await appPage.loanSummary.verifySummaryStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      })
    })

    // Step 2: Create first loan
    const loan1 = generateValidLoanData('Alice Johnson')
    loan1.amount = 40000

    await test.step('Create first loan application', async () => {
      await appPage.loanForm.createLoanApplication(loan1)
      await appPage.loanList.verifyLoanExists(loan1.applicantName)
      await appPage.loanList.verifyLoanStatus(loan1.applicantName, texts.status.pending)
    })

    // Step 3: Create second loan
    const loan2 = generateValidLoanData('Bob Smith')
    loan2.amount = 60000

    await test.step('Create second loan application', async () => {
      await appPage.loanForm.createLoanApplication(loan2)
      await appPage.loanList.verifyLoanExists(loan2.applicantName)
      await appPage.loanSummary.verifySummaryStats({
        total: 2,
        pending: 2,
        approved: 0,
        rejected: 0,
      })
    })

    // Step 4: Create third loan for rejection
    const loan3 = {
      applicantName: 'Charlie Brown',
      amount: 150000, // Will be rejected by auto-decide
      termMonths: 72,
      interestRate: 0.08,
    }

    await test.step('Create third loan application', async () => {
      await appPage.loanForm.createLoanApplication(loan3)
      await appPage.loanList.verifyLoanCount(3)
    })

    // Step 5: Manually approve first loan
    await test.step('Manually approve first loan', async () => {
      await appPage.loanList.approveLoan(loan1.applicantName)
      await appPage.loanSummary.verifySummaryStats({
        total: 3,
        pending: 2,
        approved: 1,
        rejected: 0,
      })
      await appPage.loanSummary.verifyTotalApprovedAmount(formatCurrency(loan1.amount))
    })

    // Step 6: Auto-decide second loan (should be approved)
    await test.step('Auto-decide second loan', async () => {
      await appPage.loanList.autoDecideLoan(loan2.applicantName, texts.status.approved)
      await appPage.loanSummary.verifySummaryStats({
        total: 3,
        pending: 1,
        approved: 2,
        rejected: 0,
      })
      // Total: 40000 + 60000 = 100000
      await appPage.loanSummary.verifyTotalApprovedAmount('$100,000')
    })

    // Step 7: Auto-decide third loan (should be rejected)
    await test.step('Auto-decide third loan', async () => {
      await appPage.loanList.autoDecideLoan(loan3.applicantName, texts.status.rejected)
      await appPage.loanSummary.verifySummaryStats({
        total: 3,
        pending: 0,
        approved: 2,
        rejected: 1,
      })
      // Total approved should remain 100000
      await appPage.loanSummary.verifyTotalApprovedAmount('$100,000')
    })

    // Step 8: Create and immediately reject a loan
    const loan4 = generateValidLoanData('Diana Prince')
    loan4.amount = 30000

    await test.step('Create and reject fourth loan', async () => {
      await appPage.loanForm.createLoanApplication(loan4)
      await appPage.loanList.rejectLoan(loan4.applicantName)
      await appPage.loanSummary.verifySummaryStats({
        total: 4,
        pending: 0,
        approved: 2,
        rejected: 2,
      })
    })

    // Step 9: Delete a rejected loan
    await test.step('Delete rejected loan', async () => {
      await appPage.loanList.clickDelete(loan4.applicantName)
      await appPage.confirmModal.confirmAndClose()
      await appPage.loanList.verifyLoanCount(3)
      await appPage.loanSummary.verifySummaryStats({
        total: 3,
        pending: 0,
        approved: 2,
        rejected: 1,
      })
    })

    // Step 10: Verify final state
    await test.step('Verify final state', async () => {
      await appPage.loanList.verifyLoanExists(loan1.applicantName)
      await appPage.loanList.verifyLoanExists(loan2.applicantName)
      await appPage.loanList.verifyLoanExists(loan3.applicantName)
      
      await appPage.loanList.verifyLoanStatus(loan1.applicantName, texts.status.approved)
      await appPage.loanList.verifyLoanStatus(loan2.applicantName, texts.status.approved)
      await appPage.loanList.verifyLoanStatus(loan3.applicantName, texts.status.rejected)

      await appPage.loanSummary.verifyTotalApprovedAmount('$100,000')
    })
  })
})
