import type { AuditLogEntry, AuditEventType, AuditLogFilter } from '../types/auditLog'

const AUDIT_STORAGE_KEY = 'tredgate_audit_logs'

/**
 * Generate a simple unique ID for audit entries
 */
function generateAuditId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

/**
 * Load audit logs from localStorage
 * Returns an empty array if nothing is stored
 */
export function getAuditLogs(): AuditLogEntry[] {
  try {
    const stored = localStorage.getItem(AUDIT_STORAGE_KEY)
    if (!stored) {
      return []
    }
    return JSON.parse(stored) as AuditLogEntry[]
  } catch {
    return []
  }
}

/**
 * Persist audit logs to localStorage
 */
export function saveAuditLogs(logs: AuditLogEntry[]): void {
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs))
}

/**
 * Clear all audit logs from localStorage
 */
export function clearAuditLogs(): void {
  localStorage.removeItem(AUDIT_STORAGE_KEY)
}

/**
 * Create a new audit log entry
 * Pure function that returns a new entry without side effects
 */
export function createAuditEntry(
  eventType: AuditEventType,
  loanId: string,
  applicantName: string,
  options?: {
    previousStatus?: string
    newStatus?: string
    metadata?: string
  }
): AuditLogEntry {
  return {
    id: generateAuditId(),
    timestamp: new Date().toISOString(),
    eventType,
    loanId,
    applicantName,
    previousStatus: options?.previousStatus,
    newStatus: options?.newStatus,
    metadata: options?.metadata
  }
}

/**
 * Append a new audit entry to the log
 */
export function appendAuditEntry(entry: AuditLogEntry): void {
  const logs = getAuditLogs()
  logs.push(entry)
  saveAuditLogs(logs)
}

/**
 * Filter audit logs based on criteria
 * Pure function that returns filtered array
 */
export function filterAuditLogs(
  logs: AuditLogEntry[],
  filter: AuditLogFilter
): AuditLogEntry[] {
  let filtered = [...logs]

  // Filter by event type
  if (filter.eventType) {
    filtered = filtered.filter(log => log.eventType === filter.eventType)
  }

  // Filter by status (matches previousStatus or newStatus)
  if (filter.status) {
    filtered = filtered.filter(
      log =>
        log.previousStatus === filter.status ||
        log.newStatus === filter.status
    )
  }

  // Filter by date range
  if (filter.startDate) {
    const startTime = new Date(filter.startDate).getTime()
    filtered = filtered.filter(log => new Date(log.timestamp).getTime() >= startTime)
  }

  if (filter.endDate) {
    const endTime = new Date(filter.endDate).getTime()
    filtered = filtered.filter(log => new Date(log.timestamp).getTime() <= endTime)
  }

  // Search in applicant name or loan ID
  if (filter.searchTerm && filter.searchTerm.trim() !== '') {
    const searchLower = filter.searchTerm.toLowerCase().trim()
    filtered = filtered.filter(
      log =>
        log.applicantName.toLowerCase().includes(searchLower) ||
        log.loanId.toLowerCase().includes(searchLower)
    )
  }

  return filtered
}

/**
 * Prune old audit logs, keeping only the most recent N entries
 * Pure function that returns a new array
 */
export function pruneAuditLogs(logs: AuditLogEntry[], maxEntries: number): AuditLogEntry[] {
  if (logs.length <= maxEntries) {
    return [...logs]
  }
  
  // Sort by timestamp descending and take the most recent entries
  const sorted = [...logs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  
  return sorted.slice(0, maxEntries)
}

/**
 * Prune and save audit logs, keeping only the most recent N entries
 */
export function pruneAndSaveAuditLogs(maxEntries: number): void {
  const logs = getAuditLogs()
  const pruned = pruneAuditLogs(logs, maxEntries)
  saveAuditLogs(pruned)
}
