import { Page, Response, Locator } from "@playwright/test"
import { siteUrl } from "./test_sites"
import { TestSiteAlias } from "./test_sites"
import { closest, xPath } from "./locators"

/**
 * A [Page Object Model](https://playwright.dev/docs/pom) for www sites.
 *
 * Any page manipulation that
 *  - is specific to www
 *  - can be encapsulated and understood in isolation
 * is a good candidate for addition to this class.
 */
class WwwPage {
  readonly page: Page
  readonly siteAlias: TestSiteAlias

  constructor(page: Page, site: TestSiteAlias = "www") {
    this.page = page
    this.siteAlias = site
  }

  async goto(route = ""): Promise<Response | null> {
    const fullRoute = siteUrl(this.siteAlias, route)
    return this.page.goto(fullRoute)
  }

  /**
   * Return a Locator for a Course Card by its title.
   */
  async getCourseCard(
    title: string,
    { expectedCount = 1 } = {}
  ): Promise<Locator> {
    const cardXPath = `div[${xPath.predicates.hasClass("course-card")}]`
    const courseCard = await this.page
      .getByRole("link", { name: title })
      .locator(`${closest(cardXPath)} >> visible=true`)

    await courseCard.count().then(count => {
      if (count !== expectedCount) {
        throw new Error(`Expected ${expectedCount} Course Cards, got ${count}`)
      }
    })

    return courseCard
  }
}

export default WwwPage
