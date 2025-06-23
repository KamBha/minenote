import { locators } from '@vitest/browser/context'

locators.extend({
  getChildCards() {
    return ".card-container";
  }
})

declare module '@vitest/browser/context' {
  interface LocatorSelectors {
    getChildCards(): Locator
  }
}