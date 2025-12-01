/**
 * Types of events that can be logged in the audit system
 */
export type AuditEventType =
  | 'created'
  | 'status_update_manual'
  | 'status_update_auto'
  | 'deleted'

/**
 * Represents an audit log entry for loan application events
 */
export interface AuditLogEntry {
  id: string              // unique audit entry ID
  timestamp: string       // ISO timestamp when event occurred
  eventType: AuditEventType
  loanId: string          // ID of the loan application
  applicantName: string   // name of the applicant (for easy searching)
  previousStatus?: string // previous status (for status updates)
  newStatus?: string      // new status (for status updates)
  metadata?: string       // optional context or reason
}

/**
 * Filter criteria for searching/filtering audit logs
 */
export interface AuditLogFilter {
  eventType?: AuditEventType
  status?: string
  startDate?: string
  endDate?: string
  searchTerm?: string     // search in applicant name or loan ID
}
