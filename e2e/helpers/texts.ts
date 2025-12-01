/**
 * Text library for E2E tests
 * Contains all text strings used in the application for easy maintenance
 */

export const texts = {
  // Page titles and headers
  pageTitle: 'Tredgate Loan',
  appHeading: 'Tredgate Loan',
  tagline: 'Simple loan application management',
  
  // Form labels and placeholders
  form: {
    heading: 'New Loan Application',
    applicantNameLabel: 'Applicant Name',
    applicantNamePlaceholder: 'Enter applicant name',
    amountLabel: 'Loan Amount ($)',
    amountPlaceholder: 'Enter loan amount',
    termLabel: 'Term (Months)',
    termPlaceholder: 'Enter term in months',
    interestRateLabel: 'Interest Rate (e.g., 0.08 for 8%)',
    interestRatePlaceholder: 'Enter interest rate',
    submitButton: 'Create Application',
  },
  
  // Loan list
  list: {
    heading: 'Loan Applications',
    emptyState: 'No loan applications yet. Create one using the form.',
    columnHeaders: {
      applicant: 'Applicant',
      amount: 'Amount',
      term: 'Term',
      rate: 'Rate',
      monthlyPayment: 'Monthly Payment',
      status: 'Status',
      created: 'Created',
      actions: 'Actions',
    },
  },
  
  // Summary
  summary: {
    total: 'Total Applications',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    totalApproved: 'Total Approved Amount',
  },
  
  // Status badges
  status: {
    pending: 'pending',
    approved: 'approved',
    rejected: 'rejected',
  },
  
  // Validation messages
  validation: {
    nameRequired: 'Applicant name is required',
    amountPositive: 'Amount must be greater than 0',
    termPositive: 'Term months must be greater than 0',
    interestRateRequired: 'Interest rate is required and cannot be negative',
  },
  
  // Modal
  modal: {
    deleteTitle: 'Delete Loan Application',
    deleteConfirmButton: 'Delete',
    deleteCancelButton: 'Cancel',
  },
  
  // Button titles
  buttons: {
    approve: 'Approve',
    reject: 'Reject',
    autoDecide: 'Auto-decide',
    delete: 'Delete',
  },
}
