import { Locator, Page, FrameLocator, expect } from "@playwright/test"

type ByRoleOptions = Parameters<Page["getByRole"]>[1]
export class VideoElement {
  readonly container: Locator

  constructor(page: Page) {
    this.container = page.locator(".video-embed, .video-page")
  }

  tab(opts: ByRoleOptions): Locator {
    return this.container.getByRole("tab", opts)
  }

  tabPanel(opts: ByRoleOptions): Locator {
    return this.container.getByRole("tabpanel", opts)
  }

  downloadButton(): Locator {
    return this.container.getByRole("button", {
      name: `Download Video and Transcript`
    })
  }

  downloadVideo(): Locator {
    return this.container.getByRole("link", {
      name: `Download video`
    })
  }

  downloadTranscript(): Locator {
    return this.container.getByRole("link", {
      name: `Download transcript`
    })
  }

  /**
   * @returns Returns a video section Iframe.
   */
  iframe(): Locator {
    return this.container.locator('role=region[name="Video Player"] >> iframe')
  }

  frameLocator(): FrameLocator {
    return this.iframe().frameLocator(":scope")
  }

  async expectPlayerReady(): Promise<void> {
    await expect(async () => {
      const readyState = await this.frameLocator()
        .locator("*")
        .first()
        .evaluate(() => window.document.readyState)
      expect(readyState).toEqual("complete")
    }).toPass()
  }

  playButton(): Locator {
    return this.frameLocator().getByRole("button", { name: "Play" })
  }

  transcript = {
    lines:      () => this.container.locator(".transcript-line"),
    activeLine: () => this.container.locator(".transcript-line.is-active"),
    nextLine:   () => this.container.locator(".transcript-line.is-active + div")
  }
}
