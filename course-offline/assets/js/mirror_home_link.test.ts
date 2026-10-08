import { isInMirror, initMirrorHomeLinks } from "./mirror_home_link"

const SITE_URL_PATH = "courses/1-00-intro-spring-2012"

/**
 * The logo href Hugo emits on a page two levels below the course root, as the
 * browser resolves it from `pageUrl`.
 */
const logoHrefFrom = (pageUrl: string) =>
  new URL("../.././../../index.html", pageUrl).href

describe("isInMirror", () => {
  it.each([
    "https://mirror.example.org/courses/1-00-intro-spring-2012/pages/syllabus/index.html",
    "https://mirror.example.org/ocw/courses/1-00-intro-spring-2012/pages/syllabus/index.html",
    "https://mirror.example.org/courses/1-00-intro-spring-2012/pages/syllabus/index.html#grading",
    "file:///media/ocw/courses/1-00-intro-spring-2012/pages/syllabus/index.html",
    "file:///Volumes/OCW%20Mirror/courses/1-00-intro-spring-2012/pages/syllabus/index.html"
  ])("is true for %s", pageUrl => {
    expect(isInMirror(pageUrl, logoHrefFrom(pageUrl), SITE_URL_PATH)).toBe(true)
  })

  it("is true on the course home page itself", () => {
    const pageUrl =
      "https://mirror.example.org/courses/1-00-intro-spring-2012/index.html"
    const logoHref = new URL("./../../index.html", pageUrl).href
    expect(isInMirror(pageUrl, logoHref, SITE_URL_PATH)).toBe(true)
  })

  it.each([
    // the course download zip, extracted wherever the user put it
    "file:///Users/someone/Downloads/1.00-spring-2012/pages/syllabus/index.html",
    // a folder named after the course, but not under courses/
    "file:///Users/someone/1-00-intro-spring-2012/pages/syllabus/index.html",
    // a different course whose slug merely ends with this one's
    "https://mirror.example.org/courses/x-1-00-intro-spring-2012/pages/syllabus/index.html",
    // the right slug under a folder that is not courses/
    "https://mirror.example.org/old-courses/1-00-intro-spring-2012/pages/syllabus/index.html"
  ])("is false for %s", pageUrl => {
    expect(isInMirror(pageUrl, logoHrefFrom(pageUrl), SITE_URL_PATH)).toBe(
      false
    )
  })

  it("ignores leading and trailing slashes on site_url_path", () => {
    const pageUrl =
      "https://mirror.example.org/courses/1-00-intro-spring-2012/pages/syllabus/index.html"
    expect(
      isInMirror(
        pageUrl,
        logoHrefFrom(pageUrl),
        "/courses/1-00-intro-spring-2012/"
      )
    ).toBe(true)
  })

  it("is false when site_url_path is empty", () => {
    const pageUrl = "https://mirror.example.org/pages/syllabus/index.html"
    expect(isInMirror(pageUrl, logoHrefFrom(pageUrl), "")).toBe(false)
  })
})

describe("initMirrorHomeLinks", () => {
  const LIVE_SITE_URL = "https://ocw.mit.edu/"
  const LOGO_HREF = "../.././../../index.html"
  const COURSE_HOME_HREF = "../../index.html"
  const METAS: Record<string, string> = {
    "ocw-site-url-path": SITE_URL_PATH,
    "ocw-live-site-url": LIVE_SITE_URL
  }

  const render = (pagePath: string, metas = METAS) => {
    window.history.replaceState({}, "", pagePath)
    document.head.innerHTML = Object.entries(metas)
      .map(([name, content]) => `<meta name="${name}" content="${content}">`)
      .join("")
    document.body.innerHTML = `
      <a class="ocw-logo-link" href="${LOGO_HREF}">desktop logo</a>
      <a class="ocw-logo-link" href="${LOGO_HREF}">mobile logo</a>
      <a class="course-title" href="${COURSE_HOME_HREF}">Course title</a>
    `
  }

  const hrefs = (selector: string) =>
    Array.from(document.querySelectorAll<HTMLAnchorElement>(selector)).map(
      link => link.getAttribute("href")
    )

  it("keeps the relative mirror home link inside a mirror", () => {
    render("/courses/1-00-intro-spring-2012/pages/syllabus/index.html")
    initMirrorHomeLinks()
    expect(hrefs(".ocw-logo-link")).toEqual([LOGO_HREF, LOGO_HREF])
  })

  it("points the logo links at the live site outside a mirror", () => {
    render("/Downloads/1.00-spring-2012/pages/syllabus/index.html")
    initMirrorHomeLinks()
    expect(hrefs(".ocw-logo-link")).toEqual([LIVE_SITE_URL, LIVE_SITE_URL])
  })

  it("leaves the course title link alone", () => {
    render("/Downloads/1.00-spring-2012/pages/syllabus/index.html")
    initMirrorHomeLinks()
    expect(hrefs(".course-title")).toEqual([COURSE_HOME_HREF])
  })

  it.each(["ocw-site-url-path", "ocw-live-site-url"])(
    "leaves the logo links alone without the %s meta tag",
    missing => {
      render(
        "/Downloads/1.00-spring-2012/pages/syllabus/index.html",
        Object.fromEntries(
          Object.entries(METAS).filter(([name]) => name !== missing)
        )
      )
      initMirrorHomeLinks()
      expect(hrefs(".ocw-logo-link")).toEqual([LOGO_HREF, LOGO_HREF])
    }
  )
})
