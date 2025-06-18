import { locators } from '@vitest/browser/context'

locators.extend({
  getChildCards() {
    return ".base-card";
  }
})

declare module '@vitest/browser/context' {
  interface LocatorSelectors {
    getChildCards(): Locator
  }
}