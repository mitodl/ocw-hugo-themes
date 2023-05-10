import { Page, Locator, FrameLocator, expect } from "@playwright/test"

class VideoSection {
    private readonly page: Page
  
    constructor(page: Page) {
      this.page = page
    }
  
    /**
     * Returns a playwright locator for the video section of the page, containing
     * the video player itself as well as transcript / expandable tabs.
     * 
     * @fakhar goal here is to scope other the selectors to this part of the DOM.
     */
    videoSection(): Locator {
      return this.page.locator(".video-page")
    }
  
    /**
     * @returns Returns a video section Iframe.
     */
    iframe(): Locator {
      return this.videoSection().locator(
        'role=region[name="Video Player"] >> iframe'
      )
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
      lines:      () => this.videoSection().locator(".transcript-line"),
      activeLine: () => this.transcript.lines().locator(".is-active"),
      nextLine: () => this.transcript.activeLine().locator(". + div"),
    }
  }

export default VideoSection
