/**
 * Test data helpers for E2E tests
 */

export interface LoanTestData {
  applicantName: string
  amount: number
  termMonths: number
  interestRate: number
}

/**
 * Generate valid loan data that should be auto-approved
 * (amount <= 100000 AND termMonths <= 60)
 */
export function generateApprovedLoanData(): LoanTestData {
  return {
    applicantName: 'John Doe',
    amount: 50000,
    termMonths: 36,
    interestRate: 0.05,
  }
}

/**
 * Generate valid loan data that should be auto-rejected
 * (amount > 100000 OR termMonths > 60)
 */
export function generateRejectedLoanData(): LoanTestData {
  return {
    applicantName: 'Jane Smith',
    amount: 150000,
    termMonths: 72,
    interestRate: 0.08,
  }
}

/**
 * Generate basic valid loan data
 */
export function generateValidLoanData(name: string = 'Test User'): LoanTestData {
  return {
    applicantName: name,
    amount: 25000,
    termMonths: 24,
    interestRate: 0.06,
  }
}

/**
 * Calculate expected monthly payment
 */
export function calculateExpectedMonthlyPayment(loan: LoanTestData): number {
  const total = loan.amount * (1 + loan.interestRate)
  return total / loan.termMonths
}

/**
 * Format currency for comparison (Summary uses no decimals)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format interest rate for comparison
 */
export function formatInterestRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}
