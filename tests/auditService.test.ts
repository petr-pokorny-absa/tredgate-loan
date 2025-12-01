import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import {
  getAuditLogs,
  saveAuditLogs,
  clearAuditLogs,
  createAuditEntry,
  appendAuditEntry,
  filterAuditLogs,
  pruneAuditLogs,
  pruneAndSaveAuditLogs
} from '../src/services/auditService'
import type { AuditLogEntry } from '../src/types/auditLog'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    get length() {
      return Object.keys(store).length
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null)
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('auditService', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  describe('getAuditLogs', () => {
    it('returns empty array when nothing is stored', () => {
      const logs = getAuditLogs()
      expect(logs).toEqual([])
    })

    it('returns stored audit logs', () => {
      const storedLogs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-01T00:00:00.000Z',
          eventType: 'created',
          loanId: 'loan-1',
          applicantName: 'John Doe'
        }
      ]
      localStorageMock.setItem('tredgate_audit_logs', JSON.stringify(storedLogs))

      const logs = getAuditLogs()
      expect(logs).toEqual(storedLogs)
    })

    it('returns empty array on parse error', () => {
      localStorageMock.setItem('tredgate_audit_logs', 'invalid json')
      const logs = getAuditLogs()
      expect(logs).toEqual([])
    })
  })

  describe('saveAuditLogs', () => {
    it('saves audit logs to localStorage', () => {
      const logs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-01T00:00:00.000Z',
          eventType: 'created',
          loanId: 'loan-1',
          applicantName: 'Jane Doe'
        }
      ]

      saveAuditLogs(logs)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'tredgate_audit_logs',
        JSON.stringify(logs)
      )
    })
  })

  describe('clearAuditLogs', () => {
    it('removes audit logs from localStorage', () => {
      const logs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-01T00:00:00.000Z',
          eventType: 'created',
          loanId: 'loan-1',
          applicantName: 'Test User'
        }
      ]
      saveAuditLogs(logs)

      clearAuditLogs()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tredgate_audit_logs')
    })
  })

  describe('createAuditEntry', () => {
    it('creates an audit entry for loan creation', () => {
      const entry = createAuditEntry('created', 'loan-1', 'Alice Smith')

      expect(entry.eventType).toBe('created')
      expect(entry.loanId).toBe('loan-1')
      expect(entry.applicantName).toBe('Alice Smith')
      expect(entry.id).toBeDefined()
      expect(entry.timestamp).toBeDefined()
      expect(entry.previousStatus).toBeUndefined()
      expect(entry.newStatus).toBeUndefined()
    })

    it('creates an audit entry for status update with previous and new status', () => {
      const entry = createAuditEntry(
        'status_update_manual',
        'loan-2',
        'Bob Jones',
        {
          previousStatus: 'pending',
          newStatus: 'approved'
        }
      )

      expect(entry.eventType).toBe('status_update_manual')
      expect(entry.loanId).toBe('loan-2')
      expect(entry.applicantName).toBe('Bob Jones')
      expect(entry.previousStatus).toBe('pending')
      expect(entry.newStatus).toBe('approved')
      expect(entry.id).toBeDefined()
      expect(entry.timestamp).toBeDefined()
    })

    it('creates an audit entry with metadata', () => {
      const entry = createAuditEntry(
        'status_update_auto',
        'loan-3',
        'Charlie Brown',
        {
          previousStatus: 'pending',
          newStatus: 'rejected',
          metadata: 'Auto-decision based on amount and term'
        }
      )

      expect(entry.eventType).toBe('status_update_auto')
      expect(entry.metadata).toBe('Auto-decision based on amount and term')
    })

    it('creates an audit entry for deletion', () => {
      const entry = createAuditEntry('deleted', 'loan-4', 'Diana Prince')

      expect(entry.eventType).toBe('deleted')
      expect(entry.loanId).toBe('loan-4')
      expect(entry.applicantName).toBe('Diana Prince')
    })
  })

  describe('appendAuditEntry', () => {
    it('appends entry to empty audit log', () => {
      const entry = createAuditEntry('created', 'loan-1', 'Test User')

      appendAuditEntry(entry)

      const logs = getAuditLogs()
      expect(logs).toHaveLength(1)
      expect(logs[0]).toEqual(entry)
    })

    it('appends entry to existing audit logs', () => {
      const entry1 = createAuditEntry('created', 'loan-1', 'User One')
      const entry2 = createAuditEntry('created', 'loan-2', 'User Two')

      appendAuditEntry(entry1)
      appendAuditEntry(entry2)

      const logs = getAuditLogs()
      expect(logs).toHaveLength(2)
      expect(logs[0]).toEqual(entry1)
      expect(logs[1]).toEqual(entry2)
    })
  })

  describe('filterAuditLogs', () => {
    const sampleLogs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-01T10:00:00.000Z',
        eventType: 'created',
        loanId: 'loan-1',
        applicantName: 'Alice Smith'
      },
      {
        id: '2',
        timestamp: '2024-01-02T10:00:00.000Z',
        eventType: 'status_update_manual',
        loanId: 'loan-1',
        applicantName: 'Alice Smith',
        previousStatus: 'pending',
        newStatus: 'approved'
      },
      {
        id: '3',
        timestamp: '2024-01-03T10:00:00.000Z',
        eventType: 'status_update_auto',
        loanId: 'loan-2',
        applicantName: 'Bob Jones',
        previousStatus: 'pending',
        newStatus: 'rejected'
      },
      {
        id: '4',
        timestamp: '2024-01-04T10:00:00.000Z',
        eventType: 'deleted',
        loanId: 'loan-3',
        applicantName: 'Charlie Brown'
      }
    ]

    it('returns all logs when no filter is applied', () => {
      const filtered = filterAuditLogs(sampleLogs, {})
      expect(filtered).toHaveLength(4)
    })

    it('filters by event type', () => {
      const filtered = filterAuditLogs(sampleLogs, { eventType: 'created' })
      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.eventType).toBe('created')
    })

    it('filters by status (matches newStatus)', () => {
      const filtered = filterAuditLogs(sampleLogs, { status: 'approved' })
      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.newStatus).toBe('approved')
    })

    it('filters by status (matches previousStatus)', () => {
      const filtered = filterAuditLogs(sampleLogs, { status: 'pending' })
      expect(filtered).toHaveLength(2)
    })

    it('filters by start date', () => {
      const filtered = filterAuditLogs(sampleLogs, {
        startDate: '2024-01-03T00:00:00.000Z'
      })
      expect(filtered).toHaveLength(2)
      expect(filtered[0]?.id).toBe('3')
      expect(filtered[1]?.id).toBe('4')
    })

    it('filters by end date', () => {
      const filtered = filterAuditLogs(sampleLogs, {
        endDate: '2024-01-02T23:59:59.999Z'
      })
      expect(filtered).toHaveLength(2)
      expect(filtered[0]?.id).toBe('1')
      expect(filtered[1]?.id).toBe('2')
    })

    it('filters by date range', () => {
      const filtered = filterAuditLogs(sampleLogs, {
        startDate: '2024-01-02T00:00:00.000Z',
        endDate: '2024-01-03T23:59:59.999Z'
      })
      expect(filtered).toHaveLength(2)
      expect(filtered[0]?.id).toBe('2')
      expect(filtered[1]?.id).toBe('3')
    })

    it('searches by applicant name (case-insensitive)', () => {
      const filtered = filterAuditLogs(sampleLogs, { searchTerm: 'alice' })
      expect(filtered).toHaveLength(2)
      expect(filtered[0]?.applicantName).toBe('Alice Smith')
      expect(filtered[1]?.applicantName).toBe('Alice Smith')
    })

    it('searches by partial applicant name', () => {
      const filtered = filterAuditLogs(sampleLogs, { searchTerm: 'Jones' })
      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.applicantName).toBe('Bob Jones')
    })

    it('searches by loan ID', () => {
      const filtered = filterAuditLogs(sampleLogs, { searchTerm: 'loan-2' })
      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.loanId).toBe('loan-2')
    })

    it('combines multiple filters', () => {
      const filtered = filterAuditLogs(sampleLogs, {
        eventType: 'status_update_manual',
        searchTerm: 'Alice'
      })
      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.id).toBe('2')
    })

    it('handles empty search term', () => {
      const filtered = filterAuditLogs(sampleLogs, { searchTerm: '   ' })
      expect(filtered).toHaveLength(4)
    })

    it('returns empty array when no matches found', () => {
      const filtered = filterAuditLogs(sampleLogs, { searchTerm: 'nonexistent' })
      expect(filtered).toHaveLength(0)
    })
  })

  describe('pruneAuditLogs', () => {
    const sampleLogs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-01T10:00:00.000Z',
        eventType: 'created',
        loanId: 'loan-1',
        applicantName: 'User 1'
      },
      {
        id: '2',
        timestamp: '2024-01-02T10:00:00.000Z',
        eventType: 'created',
        loanId: 'loan-2',
        applicantName: 'User 2'
      },
      {
        id: '3',
        timestamp: '2024-01-03T10:00:00.000Z',
        eventType: 'created',
        loanId: 'loan-3',
        applicantName: 'User 3'
      },
      {
        id: '4',
        timestamp: '2024-01-04T10:00:00.000Z',
        eventType: 'created',
        loanId: 'loan-4',
        applicantName: 'User 4'
      },
      {
        id: '5',
        timestamp: '2024-01-05T10:00:00.000Z',
        eventType: 'created',
        loanId: 'loan-5',
        applicantName: 'User 5'
      }
    ]

    it('returns all logs when count is less than maxEntries', () => {
      const pruned = pruneAuditLogs(sampleLogs, 10)
      expect(pruned).toHaveLength(5)
    })

    it('returns all logs when count equals maxEntries', () => {
      const pruned = pruneAuditLogs(sampleLogs, 5)
      expect(pruned).toHaveLength(5)
    })

    it('prunes to maxEntries keeping most recent', () => {
      const pruned = pruneAuditLogs(sampleLogs, 3)
      expect(pruned).toHaveLength(3)
      expect(pruned[0]?.id).toBe('5') // most recent
      expect(pruned[1]?.id).toBe('4')
      expect(pruned[2]?.id).toBe('3')
    })

    it('prunes to 1 entry keeping most recent', () => {
      const pruned = pruneAuditLogs(sampleLogs, 1)
      expect(pruned).toHaveLength(1)
      expect(pruned[0]?.id).toBe('5')
    })

    it('does not modify original array', () => {
      const original = [...sampleLogs]
      pruneAuditLogs(sampleLogs, 2)
      expect(sampleLogs).toEqual(original)
    })
  })

  describe('pruneAndSaveAuditLogs', () => {
    it('prunes and saves audit logs', () => {
      const logs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-01T10:00:00.000Z',
          eventType: 'created',
          loanId: 'loan-1',
          applicantName: 'User 1'
        },
        {
          id: '2',
          timestamp: '2024-01-02T10:00:00.000Z',
          eventType: 'created',
          loanId: 'loan-2',
          applicantName: 'User 2'
        },
        {
          id: '3',
          timestamp: '2024-01-03T10:00:00.000Z',
          eventType: 'created',
          loanId: 'loan-3',
          applicantName: 'User 3'
        }
      ]
      saveAuditLogs(logs)

      pruneAndSaveAuditLogs(2)

      const saved = getAuditLogs()
      expect(saved).toHaveLength(2)
      expect(saved[0]?.id).toBe('3') // most recent
      expect(saved[1]?.id).toBe('2')
    })
  })
})
