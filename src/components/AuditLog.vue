<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { AuditLogEntry, AuditEventType } from '../types/auditLog'
import { getAuditLogs, filterAuditLogs, clearAuditLogs } from '../services/auditService'
import ConfirmModal from './ConfirmModal.vue'

const allLogs = ref<AuditLogEntry[]>([])
const searchTerm = ref('')
const selectedEventType = ref<AuditEventType | ''>('')
const selectedStatus = ref('')
const showClearModal = ref(false)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

function loadLogs() {
  allLogs.value = getAuditLogs()
}

const filteredLogs = computed(() => {
  const filter: {
    eventType?: AuditEventType
    status?: string
    searchTerm?: string
  } = {}

  if (selectedEventType.value) {
    filter.eventType = selectedEventType.value
  }

  if (selectedStatus.value) {
    filter.status = selectedStatus.value
  }

  if (searchTerm.value) {
    filter.searchTerm = searchTerm.value
  }

  return filterAuditLogs(allLogs.value, filter)
})

const totalPages = computed(() => {
  return Math.ceil(filteredLogs.value.length / itemsPerPage)
})

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredLogs.value.slice(start, end)
})

function resetFilters() {
  searchTerm.value = ''
  selectedEventType.value = ''
  selectedStatus.value = ''
  currentPage.value = 1
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function handleClearLogs() {
  showClearModal.value = true
}

function confirmClearLogs() {
  clearAuditLogs()
  loadLogs()
  showClearModal.value = false
  currentPage.value = 1
}

function cancelClearLogs() {
  showClearModal.value = false
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function getEventTypeLabel(eventType: AuditEventType): string {
  const labels: Record<AuditEventType, string> = {
    created: 'Created',
    status_update_manual: 'Manual Update',
    status_update_auto: 'Auto Decision',
    deleted: 'Deleted'
  }
  return labels[eventType]
}

function getEventTypeClass(eventType: AuditEventType): string {
  const classes: Record<AuditEventType, string> = {
    created: 'event-created',
    status_update_manual: 'event-manual',
    status_update_auto: 'event-auto',
    deleted: 'event-deleted'
  }
  return classes[eventType]
}

onMounted(() => {
  loadLogs()
})
</script>

<template>
  <div class="audit-log card">
    <div class="audit-header">
      <h2>Audit Log</h2>
      <p class="subtitle">Track all loan application events</p>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label for="search">Search</label>
        <input
          id="search"
          v-model="searchTerm"
          type="text"
          placeholder="Search by applicant or loan ID..."
          class="search-input"
        />
      </div>

      <div class="filter-group">
        <label for="event-type">Event Type</label>
        <select id="event-type" v-model="selectedEventType">
          <option value="">All Events</option>
          <option value="created">Created</option>
          <option value="status_update_manual">Manual Update</option>
          <option value="status_update_auto">Auto Decision</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="status">Status</label>
        <select id="status" v-model="selectedStatus">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div class="filter-actions">
        <button class="btn-secondary" @click="resetFilters">Reset Filters</button>
        <button class="btn-danger" @click="handleClearLogs">Clear All Logs</button>
      </div>
    </div>

    <div v-if="filteredLogs.length === 0" class="empty-state">
      <p v-if="allLogs.length === 0">
        No audit logs yet. Events will be recorded as you interact with loan applications.
      </p>
      <p v-else>No logs match the current filters.</p>
    </div>

    <div v-else class="logs-container">
      <div class="logs-info">
        <p>
          Showing {{ paginatedLogs.length }} of {{ filteredLogs.length }} entries
          <span v-if="allLogs.length !== filteredLogs.length">({{ allLogs.length }} total)</span>
        </p>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Event Type</th>
              <th>Applicant</th>
              <th>Loan ID</th>
              <th>Status Change</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in paginatedLogs" :key="log.id">
              <td class="timestamp">{{ formatTimestamp(log.timestamp) }}</td>
              <td>
                <span :class="['event-badge', getEventTypeClass(log.eventType)]">
                  {{ getEventTypeLabel(log.eventType) }}
                </span>
              </td>
              <td>{{ log.applicantName }}</td>
              <td class="loan-id">{{ log.loanId }}</td>
              <td>
                <span v-if="log.previousStatus && log.newStatus" class="status-change">
                  <span :class="['status-badge', `status-${log.previousStatus}`]">
                    {{ log.previousStatus }}
                  </span>
                  <span class="arrow">→</span>
                  <span :class="['status-badge', `status-${log.newStatus}`]">
                    {{ log.newStatus }}
                  </span>
                </span>
                <span v-else>—</span>
              </td>
              <td class="metadata">
                <span v-if="log.metadata">{{ log.metadata }}</span>
                <span v-else>—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          Previous
        </button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>

    <ConfirmModal
      :is-open="showClearModal"
      title="Clear All Audit Logs"
      message="Are you sure you want to clear all audit logs? This action cannot be undone."
      confirm-text="Clear Logs"
      cancel-text="Cancel"
      @confirm="confirmClearLogs"
      @cancel="cancelClearLogs"
    />
  </div>
</template>

<style scoped>
.audit-log {
  width: 100%;
}

.audit-header {
  margin-bottom: 1.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.search-input {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: white;
}

.filter-group select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-danger {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background-color: var(--danger-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger:hover {
  background-color: #c82333;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

.logs-container {
  width: 100%;
}

.logs-info {
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.table-container {
  overflow-x: auto;
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: var(--table-header-bg);
}

th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid var(--border-color);
}

td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.timestamp {
  white-space: nowrap;
  font-size: 0.875rem;
}

.loan-id {
  font-family: monospace;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.event-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.event-created {
  background-color: #d1ecf1;
  color: #0c5460;
}

.event-manual {
  background-color: #fff3cd;
  color: #856404;
}

.event-auto {
  background-color: #cfe2ff;
  color: #084298;
}

.event-deleted {
  background-color: #f8d7da;
  color: #721c24;
}

.status-change {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.arrow {
  color: var(--text-secondary);
}

.metadata {
  font-size: 0.875rem;
  color: var(--text-secondary);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.page-btn:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.page-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

@media (max-width: 1200px) {
  .filters {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .table-container {
    font-size: 0.75rem;
  }

  th,
  td {
    padding: 0.5rem;
  }

  .metadata {
    max-width: 150px;
  }
}
</style>
