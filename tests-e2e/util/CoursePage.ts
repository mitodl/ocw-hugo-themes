import { Page, Response, Locator } from "@playwright/test"
import { siteUrl } from "./test_sites"
import { TestSiteAlias } from "./test_sites"
import { closest } from "./locators"

/**
 * A [Page Object Model](https://playwright.dev/docs/pom) for course sites.
 *
 * Any page manipulation that
 *  - is specific to courses
 *  - can be encapsulated and understood in isolation
 * is a good candidate for addition to this class.
 */
class CoursePage {
  readonly page: Page
  readonly siteAlias: TestSiteAlias

  constructor(page: Page, site: TestSiteAlias) {
    this.page = page
    this.siteAlias = site
  }

  async goto(route = ""): Promise<Response | null> {
    const fullRoute = siteUrl(this.siteAlias, route)
    return this.page.goto(fullRoute)
  }

  /**
   * Return a Locator for the CourseInfo section of the page. Requires that the
   * section be visible.
   *
   * Passing `{ expectedCount: 0 }` amounts to asserting that the CourseInfo
   * section is not visible.
   */
  getCourseInfo({ expectedCount = 1 } = {}): Locator {
    const courseInfo = this.page
      .getByText("Course Info")
      .locator(`${closest("section")} >> visible=true`)

    courseInfo.count().then(count => {
      if (count !== expectedCount) {
        throw new Error(
          `Expected ${expectedCount} Course Info section, got ${count}`
        )
      }
    })

    return courseInfo
  }
}

export default CoursePage
