import { test, expect } from '../fixtures/fixtures'
import { generateValidLoanData } from '../helpers/testData'
import { texts } from '../helpers/texts'

test.describe('Delete Loan Workflow', () => {
  test('should delete a pending loan', async ({ appPage }) => {
    const loanData = generateValidLoanData('Delete Test User')

    // Create a loan
    await appPage.loanForm.createLoanApplication(loanData)
    await appPage.loanList.verifyLoanExists(loanData.applicantName)
    await appPage.loanList.verifyLoanCount(1)

    // Click delete button
    await appPage.loanList.clickDelete(loanData.applicantName)

    // Verify delete confirmation modal appears
    await appPage.confirmModal.verifyDeleteConfirmation(loanData.applicantName)

    // Confirm deletion
    await appPage.confirmModal.confirmAndClose()

    // Verify loan is removed
    await appPage.loanList.verifyEmptyState()

    // Verify summary is updated
    await appPage.loanSummary.verifySummaryStats({
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    })
  })

  test('should cancel loan deletion', async ({ appPage }) => {
    const loanData = generateValidLoanData('Cancel Delete User')

    // Create a loan
    await appPage.loanForm.createLoanApplication(loanData)
    await appPage.loanList.verifyLoanExists(loanData.applicantName)

    // Click delete button
    await appPage.loanList.clickDelete(loanData.applicantName)

    // Verify delete confirmation modal appears
    await appPage.confirmModal.verifyDeleteConfirmation(loanData.applicantName)

    // Cancel deletion
    await appPage.confirmModal.cancelAndClose()

    // Verify loan still exists
    await appPage.loanList.verifyLoanExists(loanData.applicantName)
    await appPage.loanList.verifyLoanCount(1)

    // Verify summary unchanged
    await appPage.loanSummary.verifySummaryStats({
      total: 1,
      pending: 1,
      approved: 0,
      rejected: 0,
    })
  })

  test('should delete an approved loan', async ({ appPage }) => {
    const loanData = generateValidLoanData('Delete Approved')

    // Create and approve a loan
    await appPage.loanForm.createLoanApplication(loanData)
    await appPage.loanList.approveLoan(loanData.applicantName)

    // Verify initial state
    await appPage.loanSummary.verifySummaryStats({
      total: 1,
      pending: 0,
      approved: 1,
      rejected: 0,
    })

    // Delete the approved loan
    await appPage.loanList.clickDelete(loanData.applicantName)
    await appPage.confirmModal.confirmAndClose()

    // Verify loan is removed
    await appPage.loanList.verifyEmptyState()

    // Verify summary is updated
    await appPage.loanSummary.verifySummaryStats({
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    })

    // Verify total approved amount is reset
    await appPage.loanSummary.verifyTotalApprovedAmount('$0')
  })

  test('should delete one loan from multiple loans', async ({ appPage }) => {
    const loan1 = generateValidLoanData('Keep Loan 1')
    const loan2 = generateValidLoanData('Delete Loan')
    const loan3 = generateValidLoanData('Keep Loan 2')

    // Create three loans
    await appPage.loanForm.createLoanApplication(loan1)
    await appPage.loanForm.createLoanApplication(loan2)
    await appPage.loanForm.createLoanApplication(loan3)

    await appPage.loanList.verifyLoanCount(3)

    // Delete the middle loan
    await appPage.loanList.clickDelete(loan2.applicantName)
    await appPage.confirmModal.confirmAndClose()

    // Verify only the deleted loan is removed
    await appPage.loanList.verifyLoanCount(2)
    await appPage.loanList.verifyLoanExists(loan1.applicantName)
    await appPage.loanList.verifyLoanExists(loan3.applicantName)

    // Verify summary is updated
    await appPage.loanSummary.verifySummaryStats({
      total: 2,
      pending: 2,
      approved: 0,
      rejected: 0,
    })
  })

  test('should delete all loans one by one', async ({ appPage }) => {
    const loan1 = generateValidLoanData('Delete All 1')
    const loan2 = generateValidLoanData('Delete All 2')
    const loan3 = generateValidLoanData('Delete All 3')

    // Create three loans
    await appPage.loanForm.createLoanApplication(loan1)
    await appPage.loanForm.createLoanApplication(loan2)
    await appPage.loanForm.createLoanApplication(loan3)

    await appPage.loanList.verifyLoanCount(3)

    // Delete first loan
    await appPage.loanList.clickDelete(loan1.applicantName)
    await appPage.confirmModal.confirmAndClose()
    await appPage.loanList.verifyLoanCount(2)

    // Delete second loan
    await appPage.loanList.clickDelete(loan2.applicantName)
    await appPage.confirmModal.confirmAndClose()
    await appPage.loanList.verifyLoanCount(1)

    // Delete third loan
    await appPage.loanList.clickDelete(loan3.applicantName)
    await appPage.confirmModal.confirmAndClose()

    // Verify all loans are removed
    await appPage.loanList.verifyEmptyState()

    // Verify summary is reset
    await appPage.loanSummary.verifySummaryStats({
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    })
  })
})
