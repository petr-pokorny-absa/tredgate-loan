import { test, expect } from '../fixtures/fixtures'
import { generateValidLoanData, formatCurrency } from '../helpers/testData'
import { texts } from '../helpers/texts'

test.describe('Loan Approval and Rejection Workflow', () => {
  test('should approve a pending loan', async ({ appPage }) => {
    const loanData = generateValidLoanData('Emma Wilson')

    // Create a loan
    await appPage.loanForm.createLoanApplication(loanData)
    await appPage.loanList.verifyLoanStatus(loanData.applicantName, texts.status.pending)

    // Approve the loan
    await appPage.loanList.approveLoan(loanData.applicantName)

    // Verify loan status changed to approved
    await appPage.loanList.verifyLoanStatus(loanData.applicantName, texts.status.approved)

    // Verify pending action buttons are not visible
    await appPage.loanList.verifyNoPendingActionButtons(loanData.applicantName)

    // Verify summary is updated
    await appPage.loanSummary.verifySummaryStats({
      total: 1,
      pending: 0,
      approved: 1,
      rejected: 0,
    })

    // Verify total approved amount
    const expectedAmount = formatCurrency(loanData.amount)
    await appPage.loanSummary.verifyTotalApprovedAmount(expectedAmount)
  })

  test('should reject a pending loan', async ({ appPage }) => {
    const loanData = generateValidLoanData('Frank Miller')

    // Create a loan
    await appPage.loanForm.createLoanApplication(loanData)
    await appPage.loanList.verifyLoanStatus(loanData.applicantName, texts.status.pending)

    // Reject the loan
    await appPage.loanList.rejectLoan(loanData.applicantName)

    // Verify loan status changed to rejected
    await appPage.loanList.verifyLoanStatus(loanData.applicantName, texts.status.rejected)

    // Verify pending action buttons are not visible
    await appPage.loanList.verifyNoPendingActionButtons(loanData.applicantName)

    // Verify summary is updated
    await appPage.loanSummary.verifySummaryStats({
      total: 1,
      pending: 0,
      approved: 0,
      rejected: 1,
    })

    // Verify total approved amount is $0
    await appPage.loanSummary.verifyTotalApprovedAmount('$0.00')
  })

  test('should handle mixed approval and rejection', async ({ appPage }) => {
    const loan1 = generateValidLoanData('Grace Lee')
    const loan2 = generateValidLoanData('Henry Davis')
    const loan3 = generateValidLoanData('Ivy Chen')

    // Create three loans
    await appPage.loanForm.createLoanApplication(loan1)
    await appPage.loanForm.createLoanApplication(loan2)
    await appPage.loanForm.createLoanApplication(loan3)

    // Approve first loan
    await appPage.loanList.approveLoan(loan1.applicantName)

    // Reject second loan
    await appPage.loanList.rejectLoan(loan2.applicantName)

    // Leave third loan pending

    // Verify summary
    await appPage.loanSummary.verifySummaryStats({
      total: 3,
      pending: 1,
      approved: 1,
      rejected: 1,
    })

    // Verify statuses
    await appPage.loanList.verifyLoanStatus(loan1.applicantName, texts.status.approved)
    await appPage.loanList.verifyLoanStatus(loan2.applicantName, texts.status.rejected)
    await appPage.loanList.verifyLoanStatus(loan3.applicantName, texts.status.pending)

    // Verify only pending loan has action buttons
    await appPage.loanList.verifyNoPendingActionButtons(loan1.applicantName)
    await appPage.loanList.verifyNoPendingActionButtons(loan2.applicantName)
    await appPage.loanList.verifyPendingActionButtons(loan3.applicantName)

    // Verify total approved amount
    const expectedAmount = formatCurrency(loan1.amount)
    await appPage.loanSummary.verifyTotalApprovedAmount(expectedAmount)
  })

  test('should approve multiple loans and calculate correct total', async ({ appPage }) => {
    const loan1 = generateValidLoanData('John A')
    loan1.amount = 10000
    const loan2 = generateValidLoanData('John B')
    loan2.amount = 20000
    const loan3 = generateValidLoanData('John C')
    loan3.amount = 30000

    // Create and approve three loans
    await appPage.loanForm.createLoanApplication(loan1)
    await appPage.loanList.approveLoan(loan1.applicantName)

    await appPage.loanForm.createLoanApplication(loan2)
    await appPage.loanList.approveLoan(loan2.applicantName)

    await appPage.loanForm.createLoanApplication(loan3)
    await appPage.loanList.approveLoan(loan3.applicantName)

    // Verify summary
    await appPage.loanSummary.verifySummaryStats({
      total: 3,
      pending: 0,
      approved: 3,
      rejected: 0,
    })

    // Verify total approved amount (10000 + 20000 + 30000 = 60000)
    await appPage.loanSummary.verifyTotalApprovedAmount('$60,000.00')
  })
})
