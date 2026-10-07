import { getMirrorHomeUrl, initMirrorHomeLinks } from "./mirror_home_link"

const SITE_URL_PATH = "courses/1-00-intro-spring-2012"

describe("getMirrorHomeUrl", () => {
  it.each([
    [
      "https://mirror.example.org/courses/1-00-intro-spring-2012/index.html",
      "https://mirror.example.org/index.html"
    ],
    [
      "https://mirror.example.org/ocw/courses/1-00-intro-spring-2012/index.html",
      "https://mirror.example.org/ocw/index.html"
    ],
    [
      "file:///media/ocw/courses/1-00-intro-spring-2012/index.html",
      "file:///media/ocw/index.html"
    ],
    [
      "file:///Volumes/OCW%20Mirror/courses/1-00-intro-spring-2012/index.html",
      "file:///Volumes/OCW%20Mirror/index.html"
    ]
  ])("finds the mirror home above %s", (courseHomeUrl, expected) => {
    expect(getMirrorHomeUrl(courseHomeUrl, SITE_URL_PATH)).toBe(expected)
  })

  it.each([
    // the course download zip, extracted wherever the user put it
    "file:///Users/someone/Downloads/1.00-spring-2012/index.html",
    // a folder named after the course, but not under courses/
    "file:///Users/someone/1-00-intro-spring-2012/index.html",
    // a different course whose slug merely ends with this one's
    "https://mirror.example.org/courses/x-1-00-intro-spring-2012/index.html",
    // the right slug under a folder that is not courses/
    "https://mirror.example.org/old-courses/1-00-intro-spring-2012/index.html"
  ])("returns null when the course is not in a mirror (%s)", courseHomeUrl => {
    expect(getMirrorHomeUrl(courseHomeUrl, SITE_URL_PATH)).toBeNull()
  })

  it("ignores leading and trailing slashes on site_url_path", () => {
    expect(
      getMirrorHomeUrl(
        "https://mirror.example.org/courses/1-00-intro-spring-2012/index.html",
        "/courses/1-00-intro-spring-2012/"
      )
    ).toBe("https://mirror.example.org/index.html")
  })

  it("returns null when site_url_path is empty", () => {
    expect(
      getMirrorHomeUrl("https://mirror.example.org/index.html", "")
    ).toBeNull()
  })
})

describe("initMirrorHomeLinks", () => {
  const courseHome =
    "http://localhost/courses/1-00-intro-spring-2012/index.html"

  const render = (siteUrlPath: string | null) => {
    document.head.innerHTML =
      siteUrlPath === null ?
        "" :
        `<meta name="ocw-site-url-path" content="${siteUrlPath}">`
    document.body.innerHTML = `
      <a class="ocw-logo-link" href="${courseHome}">desktop logo</a>
      <a class="ocw-logo-link" href="${courseHome}">mobile logo</a>
      <a class="course-home" href="${courseHome}">Course Home</a>
    `
  }

  const hrefs = (selector: string) =>
    Array.from(document.querySelectorAll<HTMLAnchorElement>(selector)).map(
      link => link.href
    )

  it("points the logo links at the mirror home", () => {
    render(SITE_URL_PATH)
    initMirrorHomeLinks()
    expect(hrefs(".ocw-logo-link")).toEqual([
      "http://localhost/index.html",
      "http://localhost/index.html"
    ])
  })

  it("leaves other links to the course home alone", () => {
    render(SITE_URL_PATH)
    initMirrorHomeLinks()
    expect(hrefs(".course-home")).toEqual([courseHome])
  })

  it("leaves the logo links alone outside a mirror", () => {
    render("courses/some-other-course")
    initMirrorHomeLinks()
    expect(hrefs(".ocw-logo-link")).toEqual([courseHome, courseHome])
  })

  it("leaves the logo links alone without a site_url_path", () => {
    render(null)
    initMirrorHomeLinks()
    expect(hrefs(".ocw-logo-link")).toEqual([courseHome, courseHome])
  })
})
