import { beforeEach } from 'vitest'
import { cleanup } from '@solidjs/testing-library'

// Clean up after each test
beforeEach(() => {
  cleanup()
})

// Add custom matchers
expect.extend({
  toBeInTheDocument(received) {
    const pass = received != null && received.isConnected === true
    return {
      message: () =>
        pass
          ? `expected element not to be in the document`
          : `expected element to be in the document`,
      pass,
    }
  },
  toHaveTextContent(received, expected) {
    const pass = received?.textContent === expected
    return {
      message: () =>
        pass
          ? `expected element not to have text content "${expected}"`
          : `expected element to have text content "${expected}", but got "${received?.textContent}"`,
      pass,
    }
  },
  toHaveClass(received, ...expected) {
    const classList = received?.classList || []
    const pass = expected.every(cls => classList.contains(cls))
    return {
      message: () =>
        pass
          ? `expected element not to have classes: ${expected.join(', ')}`
          : `expected element to have classes: ${expected.join(', ')}, but got: ${[...classList].join(', ')}`,
      pass,
    }
  },
  toBeDisabled(received) {
    const pass = received?.disabled === true
    return {
      message: () =>
        pass
          ? `expected element not to be disabled`
          : `expected element to be disabled`,
      pass,
    }
  },
})

declare global {
  namespace Vi {
    interface AsymmetricMatchersContaining {
      toBeInTheDocument(): any
      toHaveTextContent(text: string): any
      toHaveClass(...classes: string[]): any
      toBeDisabled(): any
    }
  }
}
