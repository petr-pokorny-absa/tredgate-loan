# Tredgate Loan

A simple loan application management demo built with Vue 3, TypeScript, and Vite.

## Overview

Tredgate Loan is a frontend-only demo application used for training on GitHub Copilot features. It demonstrates a small, realistic frontend project without any backend server or external database.

## Features

- Create loan applications with applicant name, amount, term, and interest rate
- View all loan applications in a table
- Approve or reject loan applications manually
- Auto-decide loans based on simple business rules:
  - Approved if amount ≤ $100,000 AND term ≤ 60 months
  - Rejected otherwise
- Calculate monthly payments
- View summary statistics
- **Audit Log System**: Track all loan application events with comprehensive logging
  - Records all create, update, auto-decision, and delete events
  - Filter by event type, status, and date range
  - Search by applicant name or loan ID
  - View detailed event history with timestamps and metadata

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Vitest** - Unit testing framework
- **ESLint** - Code linting

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testing

```bash
npm run test
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── assets/           # Global CSS styles
├── components/       # Vue components
│   ├── LoanForm.vue     # Form to create new loans
│   ├── LoanList.vue     # Table of loan applications
│   └── LoanSummary.vue  # Statistics display
├── services/         # Business logic
│   └── loanService.ts   # Loan operations
├── types/            # TypeScript definitions
│   └── loan.ts          # Loan domain types
├── App.vue           # Main application component
└── main.ts           # Application entry point
tests/
└── loanService.test.ts  # Unit tests
```

## Data Persistence

All data is stored in the browser's localStorage:
- **Loan applications**: `tredgate_loans`
- **Audit logs**: `tredgate_audit_logs`

No backend server or external database is used.

## Audit Log System

The audit log system tracks all loan application events and provides a comprehensive history of changes.

### Features

- **Automatic Event Recording**: All loan operations are automatically logged
  - Loan creation
  - Manual status updates (approve/reject)
  - Auto-decision events
  - Loan deletion
  
- **Rich Metadata**: Each audit entry includes:
  - Timestamp (precise to the millisecond)
  - Event type
  - Loan ID
  - Applicant name
  - Status changes (previous → new)
  - Optional metadata (e.g., auto-decision criteria)

- **Filtering and Search**:
  - Filter by event type (created, manual update, auto decision, deleted)
  - Filter by loan status (pending, approved, rejected)
  - Search by applicant name or loan ID (case-insensitive)
  - Date range filtering (start date, end date)

- **User Interface**:
  - Clean, color-coded event badges
  - Status change visualization with arrows
  - Pagination for large datasets (10 entries per page)
  - Clear all logs functionality with confirmation modal

### Usage Examples

#### Viewing Audit Logs

Navigate to the "Audit Log" section at the bottom of the application to view all recorded events.

#### Filtering Events

```typescript
// Example: Filter audit logs programmatically
import { getAuditLogs, filterAuditLogs } from './services/auditService'

const allLogs = getAuditLogs()

// Filter by event type
const createdEvents = filterAuditLogs(allLogs, { eventType: 'created' })

// Filter by status
const approvedChanges = filterAuditLogs(allLogs, { status: 'approved' })

// Search by applicant
const aliceEvents = filterAuditLogs(allLogs, { searchTerm: 'Alice' })

// Combine filters
const autoDecisions = filterAuditLogs(allLogs, {
  eventType: 'status_update_auto',
  status: 'rejected'
})
```

#### Recording Custom Events

```typescript
import { createAuditEntry, appendAuditEntry } from './services/auditService'

// Record a loan creation
const entry = createAuditEntry('created', loanId, applicantName)
appendAuditEntry(entry)

// Record a status update with context
const updateEntry = createAuditEntry(
  'status_update_manual',
  loanId,
  applicantName,
  {
    previousStatus: 'pending',
    newStatus: 'approved',
    metadata: 'Manual approval by admin'
  }
)
appendAuditEntry(updateEntry)
```

#### Pruning Old Logs

```typescript
import { pruneAndSaveAuditLogs } from './services/auditService'

// Keep only the most recent 1000 entries
pruneAndSaveAuditLogs(1000)
```

### Event Types

| Event Type | Description | Metadata |
|------------|-------------|----------|
| `created` | New loan application created | None |
| `status_update_manual` | Status manually changed | Previous/new status |
| `status_update_auto` | Status changed by auto-decision | Previous/new status, decision criteria |
| `deleted` | Loan application deleted | None |

### Architecture

The audit log system follows these principles:

- **Pure Functions**: All core logic uses pure functions for easy testing
- **localStorage Only**: No external dependencies or backend required
- **Immutable Operations**: Filtering and searching return new arrays
- **Type Safety**: Full TypeScript support with strict types
- **Minimal Overhead**: Efficient storage and retrieval

## License

MIT
