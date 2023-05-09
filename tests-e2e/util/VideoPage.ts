import { Locator, Page, Response } from "@playwright/test"
import { CoursePage } from "."

export class VideoPage {
  readonly page: Page
  readonly coursePage: CoursePage
  readonly tabs: Locator
  readonly tabPanels: Locator

  constructor(page: Page) {
    this.page = page
    this.coursePage = new CoursePage(page, "course")
    this.tabs = page.getByRole("tab")
    this.tabPanels = page.getByRole("tabpanel", { includeHidden: true })
  }

  async goto(route = ""): Promise<Response | null> {
    return this.coursePage.goto(route)
  }
}
