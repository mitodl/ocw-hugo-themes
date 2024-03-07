import { expect, Page, Locator } from "@playwright/test"

/**
 * A utility to help assert that clicking an element opens a new tab
 * with the expected `url`.
 *
 * @param page A playwright page.
 * @param url The url of the new tab.
 * @param trigger The element that, when clicked, opens the new tab.
 */
export async function expectTriggerToOpenANewTab(
  page: Page,
  url: string,
  trigger: Locator
) {
  const newTabPromise = page.waitForEvent("popup")

  await trigger.click()

  const newTab = await newTabPromise
  await newTab.waitForURL(url, { waitUntil: "commit" })
  await expect(newTab).toHaveURL(url)
}
