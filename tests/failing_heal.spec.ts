/**
 * Self-Healing Demo Test
 * 
 * This test file is intentionally designed to fail to demonstrate the
 * self-healing workflow with GitHub Copilot agent. The test is excluded
 * from the main CI workflow and is only run by the self-healing workflow.
 * 
 * When this test fails, the self-healing workflow creates an issue assigned
 * to the Copilot agent with failure details, and Copilot attempts to fix it.
 */
import { describe, it, expect } from 'vitest'

describe('Self-Healing Demo', () => {
  it('should demonstrate a fixable test failure', () => {
    // This assertion intentionally fails to trigger the self-healing workflow.
    // To fix: change the expected value to match the actual value.
    const actualValue = 42
    const expectedValue = 43 // Bug: This should be 42 to match actualValue
    
    expect(actualValue).toBe(expectedValue)
  })
})
