import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // If you want to keep running your existing tests in Node.js, uncomment the next line.
  // 'vite.config.ts',
  {
    extends: 'vite.config.ts',

    test: {
      name: "browser",
      include: ["**/*.browser.test.ts[x]"],
      browser: {
        enabled: true,
        headless: true,
        provider: 'playwright',
        // https://vitest.dev/guide/browser/playwright
        instances: [
          { browser: 'chromium' },
          { browser: 'firefox' },
          // { browser: 'webkit' },
        ],
      },

    },
  },

  {
    extends: 'vite.config.ts',

    test: {
      environment: "jsdom",
      exclude: ["**/*.browser.test.ts[x]", "node_modules"],
      name: "unit",
      globals: true,
      setupFiles: ["./src/testHelpers/setup.ts"]
    },
  },
])
