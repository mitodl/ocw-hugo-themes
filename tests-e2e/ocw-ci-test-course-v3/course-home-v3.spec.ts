import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test.describe("Course description", () => {
  test("clamps to a fixed number of lines with a working toggle", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/")

    const description = page.locator("#course-description-text")
    const toggle = page.locator("#toggle-description")

    // Collapsed by default: clamped, overflowing, toggle visible.
    // The toggle must carry d-flex and not d-none: both are !important
    // Bootstrap display utilities and d-flex wins over d-none, so the JS
    // swaps them as a pair.
    await expect(description).toHaveCSS("-webkit-line-clamp", "5")
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveClass(/d-flex/)
    await expect(toggle).not.toHaveClass(/d-none/)
    await expect(toggle).toHaveText("Show more")
    await expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(
      await description.evaluate(el => el.scrollHeight > el.clientHeight)
    ).toBe(true)

    // Expand
    await toggle.click()
    await expect(description).toHaveCSS("-webkit-line-clamp", "none")
    await expect(toggle).toHaveText("Show less")
    await expect(toggle).toHaveAttribute("aria-expanded", "true")
    expect(
      await description.evaluate(el => el.scrollHeight > el.clientHeight)
    ).toBe(false)

    // Collapse again
    await toggle.click()
    await expect(description).toHaveCSS("-webkit-line-clamp", "5")
    await expect(toggle).toHaveText("Show more")
    await expect(toggle).toHaveAttribute("aria-expanded", "false")
  })

  test("hides the toggle when the description does not overflow", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/")

    const description = page.locator("#course-description-text")
    const toggle = page.locator("#toggle-description")
    await expect(toggle).toBeVisible()

    // Shrink the content in-page so the clamped element no longer overflows;
    // the ResizeObserver re-check must hide the toggle. Asserting rendered
    // visibility (not class state) guards against the Bootstrap 4 pitfall
    // where d-flex overrides d-none and the button stays visible.
    await description.evaluate(element => {
      element.textContent = "A short description."
    })
    await expect(toggle).toBeHidden()

    // Make it overflow again: the toggle must come back.
    await description.evaluate(element => {
      element.textContent = "More text than fits in five lines. ".repeat(50)
    })
    await expect(toggle).toBeVisible()
  })

  test("re-checks overflow when a webfont finishes loading", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/")

    const description = page.locator("#course-description-text")
    const toggle = page.locator("#toggle-description")

    // Baseline: the default description overflows its 5-line clamp, so the
    // toggle is shown.
    await expect(toggle).toBeVisible()
    expect(
      await description.evaluate(el => el.scrollHeight - el.clientHeight > 2)
    ).toBe(true)

    // Force the toggle into a stale (hidden) state while the text still
    // overflows. This isolates the font listener: nothing else can restore
    // the toggle — we never click, and the ResizeObserver stays silent because
    // #course-description-text has a fixed `line-height`, so its collapsed
    // clientHeight is pinned at 5 line-boxes and does not change. The only
    // thing that can heal the toggle is the document.fonts "loadingdone"
    // re-check. This is the exact case a webfont swap creates in production:
    // the wrapped line count changes without the clamped element's height
    // changing, which the ResizeObserver cannot observe.
    await toggle.evaluate(el => {
      el.classList.add("d-none")
      el.classList.remove("d-flex")
    })
    await expect(toggle).toBeHidden()

    // Trigger a genuine webfont load. A 724-byte real woff2 embedded as a
    // data URI keeps this self-contained (no hashed asset path, no CORS): it
    // loads successfully in every browser/mode and drives document.fonts
    // through loading -> loadingdone for real.
    const FONT_DATA_URI =
      "url(data:font/woff2;base64,d09GMk9UVE8AAALUAAoAAAAABiQAAAKMAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAADYMLHGYGYAB4ATYCJAM8BAYFg2wHIBtwBSCeBXbDdRHKYBOdMKFlPEuOQ2mh6Pfb3vuIa9cE0z2phEIp1EjIEBJD5EAv7wHUQmpr8zZ0ZFIT1W7vp/FCzzBKJA2EP+Dn/5p8LXj9/B/g4SFmgCX287sFRdF8hqNhJcrEJjKnAeFsXlvsfJtEqo9XE4tesRWKsvVBckmSU1pC5Rl8YySf2NzG8njFJdy4icZ/b68cMikUYmOISSifQ9uU+OiYB4TI62ukFSblO2/S3T8B0IOJQCHpgqUwriL4CuItQLgYwdx48uDFXaxoPqKE8hNHITjbLSM7r7CkvKq2obmts6d/aHRiem5xZX1r9+D4DBtjY2NYOBYu+omRyyqrSpW+hxeoIxb7/lNWFhdWldAXZbVyoUxR1fzWEd0cH99MNBIfj6T/LZ3cKKKPb2XRfGbCTIRcREJddaZSeVNDealsMPr8RFltWC6fUGRjY/1OEPCoMYXfnv7hwD4pZQXAZgO8062bl50JVCgyNjZALq8iQrYP2COExMYpgi2CwU0kjljogx2TmgDQSABNTo1H2ghKe5CVxxCIziG6A1xcDDip6f9/wEnK+PL+N4D4AhxwAHAJExHgE2JKocvC87N4hRBlUAS4OaRJcCTIwwHhc9v3TuLYv7ssA8CXczwIwC90wB4ADAOwGABCQoQQ1qaCd1yAPMBpi0DDDRzBkpeWRN4IePKWozHeZuCFt+tEF3K8IhHcFCpSrUS2TFnKKDNlzIQNZV4KwUx5EMr8QTeGlLnIi5SFGjqlijMRpRAlKiDSGQqQogyiRLYURi0faQoVAFioXIF0oXSmcnnLKWlqsA1TpgyIjjVoU+FMaVvGjN+XOXOGzFiyYsOclYPhwEbvzsAgxAxWJ2AAAA==)"
    await page.evaluate(async fontSrc => {
      const face = new FontFace("e2e-fontcheck-probe", fontSrc)
      document.fonts.add(face)
      await face.load()
    }, FONT_DATA_URI)

    // The document.fonts "loadingdone" listener re-ran the overflow check and
    // restored the toggle.
    await expect(toggle).toBeVisible()
  })
})
