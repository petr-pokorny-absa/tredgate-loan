import { test } from '../fixtures/fixtures'
import { generateValidLoanData } from '../helpers/testData'
import { texts } from '../helpers/texts'

test.describe('Loan Application Creation', () => {
  test('should create a new loan application successfully', async ({ appPage }) => {
    const loanData = generateValidLoanData('Alice Johnson')

    // Verify initial empty state
    await appPage.loanList.verifyEmptyState()
    await appPage.loanSummary.verifySummaryStats({
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    })

    // Create loan application
    await appPage.loanForm.createLoanApplication(loanData)

    // Verify loan appears in the list
    await appPage.loanList.verifyTableIsVisible()
    await appPage.loanList.verifyLoanExists(loanData.applicantName)
    await appPage.loanList.verifyLoanStatus(loanData.applicantName, texts.status.pending)
    await appPage.loanList.verifyPendingActionButtons(loanData.applicantName)

    // Verify summary is updated
    await appPage.loanSummary.verifySummaryStats({
      total: 1,
      pending: 1,
      approved: 0,
      rejected: 0,
    })
  })

  test('should create multiple loan applications', async ({ appPage }) => {
    const loan1 = generateValidLoanData('Bob Smith')
    const loan2 = generateValidLoanData('Carol White')
    const loan3 = generateValidLoanData('David Brown')

    // Create three loans
    await appPage.loanForm.createLoanApplication(loan1)
    await appPage.loanForm.createLoanApplication(loan2)
    await appPage.loanForm.createLoanApplication(loan3)

    // Verify all loans appear
    await appPage.loanList.verifyLoanCount(3)
    await appPage.loanList.verifyLoanExists(loan1.applicantName)
    await appPage.loanList.verifyLoanExists(loan2.applicantName)
    await appPage.loanList.verifyLoanExists(loan3.applicantName)

    // Verify summary
    await appPage.loanSummary.verifySummaryStats({
      total: 3,
      pending: 3,
      approved: 0,
      rejected: 0,
    })
  })
})
