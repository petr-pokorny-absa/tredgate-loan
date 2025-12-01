import { test } from '../fixtures/fixtures'
import { generateApprovedLoanData, generateRejectedLoanData, formatCurrency } from '../helpers/testData'
import { texts } from '../helpers/texts'

test.describe('Auto-Decide Loan Workflow', () => {
  test('should auto-approve loan when criteria met (amount ≤ $100,000 AND term ≤ 60 months)', async ({ appPage }) => {
    const loanData = generateApprovedLoanData() // amount: 50000, term: 36

    // Create a loan
    await appPage.loanForm.createLoanApplication(loanData)
    await appPage.loanList.verifyLoanStatus(loanData.applicantName, texts.status.pending)

    // Auto-decide the loan
    await appPage.loanList.autoDecideLoan(loanData.applicantName, texts.status.approved)

    // Verify loan is approved
    await appPage.loanList.verifyLoanStatus(loanData.applicantName, texts.status.approved)

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

  test('should auto-reject loan when amount exceeds $100,000', async ({ appPage }) => {
    const loanData = generateRejectedLoanData() // amount: 150000, term: 72

    // Create a loan
    await appPage.loanForm.createLoanApplication(loanData)
    await appPage.loanList.verifyLoanStatus(loanData.applicantName, texts.status.pending)

    // Auto-decide the loan
    await appPage.loanList.autoDecideLoan(loanData.applicantName, texts.status.rejected)

    // Verify loan is rejected
    await appPage.loanList.verifyLoanStatus(loanData.applicantName, texts.status.rejected)

    // Verify summary is updated
    await appPage.loanSummary.verifySummaryStats({
      total: 1,
      pending: 0,
      approved: 0,
      rejected: 1,
    })

    // Verify total approved amount is $0
    await appPage.loanSummary.verifyTotalApprovedAmount('$0')
  })

  test('should auto-reject loan when term exceeds 60 months', async ({ appPage }) => {
    const loanData = {
      applicantName: 'Long Term Loan',
      amount: 50000, // Within limit
      termMonths: 72, // Exceeds limit
      interestRate: 0.05,
    }

    // Create a loan
    await appPage.loanForm.createLoanApplication(loanData)
    await appPage.loanList.verifyLoanStatus(loanData.applicantName, texts.status.pending)

    // Auto-decide the loan
    await appPage.loanList.autoDecideLoan(loanData.applicantName, texts.status.rejected)

    // Verify loan is rejected
    await appPage.loanList.verifyLoanStatus(loanData.applicantName, texts.status.rejected)
  })

  test('should auto-approve loan at exact boundary (amount = $100,000, term = 60 months)', async ({ appPage }) => {
    const loanData = {
      applicantName: 'Boundary Case',
      amount: 100000,
      termMonths: 60,
      interestRate: 0.05,
    }

    // Create a loan
    await appPage.loanForm.createLoanApplication(loanData)

    // Auto-decide the loan
    await appPage.loanList.autoDecideLoan(loanData.applicantName, texts.status.approved)

    // Verify loan is approved
    await appPage.loanList.verifyLoanStatus(loanData.applicantName, texts.status.approved)

    // Verify total approved amount
    await appPage.loanSummary.verifyTotalApprovedAmount('$100,000')
  })

  test('should handle auto-decide for multiple loans', async ({ appPage }) => {
    const approvedLoan1 = {
      applicantName: 'Auto Approve 1',
      amount: 30000,
      termMonths: 24,
      interestRate: 0.05,
    }

    const approvedLoan2 = {
      applicantName: 'Auto Approve 2',
      amount: 50000,
      termMonths: 36,
      interestRate: 0.06,
    }

    const rejectedLoan = {
      applicantName: 'Auto Reject',
      amount: 120000,
      termMonths: 48,
      interestRate: 0.07,
    }

    // Create three loans
    await appPage.loanForm.createLoanApplication(approvedLoan1)
    await appPage.loanForm.createLoanApplication(approvedLoan2)
    await appPage.loanForm.createLoanApplication(rejectedLoan)

    // Auto-decide all loans
    await appPage.loanList.autoDecideLoan(approvedLoan1.applicantName, texts.status.approved)
    await appPage.loanList.autoDecideLoan(approvedLoan2.applicantName, texts.status.approved)
    await appPage.loanList.autoDecideLoan(rejectedLoan.applicantName, texts.status.rejected)

    // Verify summary
    await appPage.loanSummary.verifySummaryStats({
      total: 3,
      pending: 0,
      approved: 2,
      rejected: 1,
    })

    // Verify total approved amount (30000 + 50000 = 80000)
    await appPage.loanSummary.verifyTotalApprovedAmount('$80,000')
  })
})
