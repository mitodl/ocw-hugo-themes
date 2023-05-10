import { Locator, Page } from "@playwright/test"

type ByRoleOptions = Parameters<Page["getByRole"]>[1]
export class VideoElement {
  readonly container: Locator

  constructor(page: Page) {
    this.container = page.locator(".video-page")
  }

  tab(opts: ByRoleOptions): Locator {
    return this.container.getByRole("tab", opts)
  }

  tabPanel(opts: ByRoleOptions): Locator {
    return this.container.getByRole("tabpanel", opts)
  }
}
