# End-to-End Testing with Playwright

This directory contains E2E tests for the Tredgate Loan application using Playwright.

## Test Structure

The tests follow the Page Object Model (POM) pattern for better maintainability and reusability:

```
e2e/
├── fixtures/          # Custom test fixtures
│   └── fixtures.ts    # AppPage fixture for clean test setup
├── helpers/           # Utility functions
│   ├── testData.ts    # Test data generators and formatters
│   └── texts.ts       # Text library for UI strings
├── pages/             # Page Object Model
│   ├── BasePage.ts    # Base page with common functionality
│   ├── AppPage.ts     # Main app page combining all components
│   ├── LoanFormPage.ts      # Loan form interactions
│   ├── LoanListPage.ts      # Loan list table interactions
│   ├── LoanSummaryPage.ts   # Summary statistics
│   └── ConfirmModalPage.ts  # Delete confirmation modal
└── tests/             # Test specifications
    ├── loanCreation.spec.ts     # Loan creation tests
    ├── loanApproval.spec.ts     # Approve/reject workflow tests
    ├── loanAutoDecide.spec.ts   # Auto-decision tests
    ├── loanDeletion.spec.ts     # Delete workflow tests
    └── e2e.spec.ts              # Comprehensive end-to-end test
```

## Test Coverage

### Core Workflows Tested

1. **Loan Creation** (2 tests)
   - Create single loan application
   - Create multiple loan applications

2. **Approval/Rejection** (4 tests)
   - Approve pending loan
   - Reject pending loan
   - Mixed approval and rejection
   - Multiple approvals with total calculation

3. **Auto-Decision** (5 tests)
   - Auto-approve when criteria met (≤$100k, ≤60 months)
   - Auto-reject when amount exceeds limit
   - Auto-reject when term exceeds limit
   - Boundary testing
   - Multiple auto-decisions

4. **Deletion** (5 tests)
   - Delete pending loan
   - Cancel deletion
   - Delete approved loan
   - Delete one from multiple
   - Delete all loans

5. **End-to-End** (1 test)
   - Complete workflow combining all operations

**Total: 17 E2E tests**

## Running Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run Tests in UI Mode (Interactive)
```bash
npm run test:e2e:ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

### Run Tests in Debug Mode
```bash
npm run test:e2e:debug
```

### View Test Report
```bash
npm run test:e2e:report
```

### Run Specific Test File
```bash
npx playwright test e2e/tests/loanCreation.spec.ts
```

### Run Tests Matching a Pattern
```bash
npx playwright test --grep "approve"
```

## Test Architecture

### Page Object Model

Each page object contains:
- **Locators**: Defined once, reused across tests
- **Atomic actions**: Simple, single-purpose methods
- **Grouped actions**: Complex workflows with test.step()
- **Assertions**: All expects are inside page objects with custom messages

### Best Practices Followed

1. **Atomic Methods**: Small, focused methods for individual actions
2. **Grouped Methods**: Complex workflows combining multiple steps
3. **Clear Naming**: Descriptive method and variable names
4. **Custom Messages**: All assertions include helpful error messages
5. **Text Library**: No hardcoded strings in tests or page objects
6. **Test Data Helpers**: Reusable data generators
7. **Isolated Tests**: Each test starts with clean state
8. **Deterministic**: Tests are reliable and repeatable
9. **No Logic in Tests**: Business logic stays in page objects
10. **Stable Locators**: Prefer IDs, then semantic selectors

## Configuration

Tests are configured in `playwright.config.ts`:
- Browser: Chromium (can be extended to Firefox, WebKit)
- Base URL: http://localhost:5173
- Retries: 2 retries in CI, 0 locally
- Parallel: Full parallelization
- Artifacts: Screenshots and videos on failure

## CI/CD Integration

Tests can be triggered manually via GitHub Actions:
- Workflow: `.github/workflows/playwright.yml`
- Trigger: Manual (`workflow_dispatch`)
- Artifacts: HTML report and test results

## Debugging Failed Tests

### View Trace
```bash
npx playwright show-trace test-results/[test-path]/trace.zip
```

### Screenshots
Failed test screenshots are saved in `test-results/` directory.

### HTML Report
Open `playwright-report/index.html` to see detailed results with:
- Test execution timeline
- Screenshots and videos
- Error messages and stack traces
- Network activity

## Adding New Tests

1. Create test file in `e2e/tests/`
2. Import fixtures: `import { test, expect } from '../fixtures/fixtures'`
3. Use `appPage` fixture for clean state
4. Access page objects via `appPage.loanForm`, `appPage.loanList`, etc.
5. Write descriptive test names
6. Include assertions with custom messages

Example:
```typescript
import { test, expect } from '../fixtures/fixtures'

test.describe('Feature Name', () => {
  test('should do something specific', async ({ appPage }) => {
    // Test implementation using page objects
    await appPage.loanForm.createLoanApplication(loanData)
    await appPage.loanList.verifyLoanExists(loanData.applicantName)
  })
})
```

## Maintenance

### Updating Locators
If UI elements change, update only the page object locators. Tests remain unchanged.

### Updating Text
Update `e2e/helpers/texts.ts` if UI text changes.

### Extending Page Objects
Add new methods to page objects following the atomic/grouped pattern.

## Troubleshooting

### Tests Failing Locally
1. Ensure dev server is not already running
2. Clear localStorage: `localStorage.clear()` in browser console
3. Check browser version: `npx playwright --version`

### Tests Timing Out
- Increase timeout in `playwright.config.ts`
- Check if server starts properly
- Verify network connectivity

### Element Not Found
- Inspect element in browser
- Verify locator in `page object`
- Check if element has loaded (wait for network idle)
