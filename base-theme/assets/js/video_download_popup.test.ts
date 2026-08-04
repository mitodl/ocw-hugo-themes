import { initVideoDownloadPopup } from "./video_download_popup"

type SectionSpec = { icon: boolean; popup: boolean }

/**
 * Mirrors the structure video_expandable_tab.html emits: one
 * .video-tab-toggle-section per tab, with the download button inside
 * .video-tab-header and the popup as a following sibling.
 */
const section = ({ icon, popup }: SectionSpec) => `
  <div class="video-tab-toggle-section">
    <div class="video-tab-header">
      ${
  icon ?
    '<button class="video-download-icons" aria-expanded="false"></button>' :
    ""
}
    </div>
    ${popup ? '<div class="video-tab-download-popup hidden"></div>' : ""}
  </div>
`

const render = (...sections: SectionSpec[]) => {
  document.body.innerHTML = sections.map(section).join("")
  initVideoDownloadPopup()
  return {
    icons: Array.from(
      document.querySelectorAll<HTMLElement>(".video-download-icons")
    ),
    popups: Array.from(
      document.querySelectorAll<HTMLElement>(".video-tab-download-popup")
    )
  }
}

describe("initVideoDownloadPopup", () => {
  it("opens the popup in the clicked icon's own section", () => {
    // A tab with a popup but no download button comes first, so pairing by
    // document index would open the wrong popup.
    const { icons, popups } = render(
      { icon: false, popup: true },
      { icon: true, popup: true }
    )

    icons[0].click()

    expect(popups[1].classList.contains("hidden")).toBe(false)
    expect(popups[0].classList.contains("hidden")).toBe(true)
    expect(icons[0].getAttribute("aria-expanded")).toBe("true")
  })

  it("closes the popup when its icon is clicked again", () => {
    const { icons, popups } = render({ icon: true, popup: true })

    icons[0].click()
    expect(popups[0].classList.contains("hidden")).toBe(false)

    icons[0].click()
    expect(popups[0].classList.contains("hidden")).toBe(true)
    expect(icons[0].getAttribute("aria-expanded")).toBe("false")
  })

  it("closes the previously open popup when another icon is clicked", () => {
    const { icons, popups } = render(
      { icon: true, popup: true },
      { icon: true, popup: true }
    )

    icons[0].click()
    icons[1].click()

    expect(popups[0].classList.contains("hidden")).toBe(true)
    expect(icons[0].getAttribute("aria-expanded")).toBe("false")
    expect(popups[1].classList.contains("hidden")).toBe(false)
    expect(icons[1].getAttribute("aria-expanded")).toBe("true")
  })

  it("resets a popup to its main menu view when it is closed", () => {
    const { icons, popups } = render({ icon: true, popup: true })

    icons[0].click()
    popups[0].setAttribute("data-view", "submenu")
    icons[0].click()

    expect(popups[0].hasAttribute("data-view")).toBe(false)
  })

  it("ignores an icon whose section has no popup", () => {
    const { icons } = render({ icon: true, popup: false })

    expect(() => icons[0].click()).not.toThrow()
  })
})
