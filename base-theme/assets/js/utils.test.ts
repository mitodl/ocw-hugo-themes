import { fastlyOptimizedGalleryUrl, fastlyOptimizedUrl } from "./utils"

describe("fastlyOptimizedUrl", () => {
  it("adds Fastly params to root-relative URLs", () => {
    expect(
      fastlyOptimizedUrl("/images/example.jpg", {
        format:  "webp",
        quality: "75",
        width:   "480"
      })
    ).toBe("/images/example.jpg?format=webp&quality=75&width=480")
  })

  it("preserves existing query params", () => {
    expect(
      fastlyOptimizedUrl("https://example.edu/image.jpg?foo=bar", {
        width: "1280"
      })
    ).toBe("https://example.edu/image.jpg?foo=bar&width=1280")
  })

  it("leaves relative offline paths unchanged", () => {
    expect(
      fastlyOptimizedUrl("../../static_resources/example.jpg", {
        width: "480"
      })
    ).toBe("../../static_resources/example.jpg")
  })
})

describe("fastlyOptimizedGalleryUrl", () => {
  it("resolves relative gallery images against a root-relative base URL", () => {
    expect(
      fastlyOptimizedGalleryUrl("example.jpg", "/courses/example/", {
        format: "webp",
        width:  "480"
      })
    ).toBe("/courses/example/example.jpg?format=webp&width=480")
  })

  it("resolves relative gallery images against an absolute base URL", () => {
    expect(
      fastlyOptimizedGalleryUrl(
        "example.jpg",
        "https://ocw.mit.edu/courses/example/",
        {
          format: "webp",
          width:  "1920"
        }
      )
    ).toBe(
      "https://ocw.mit.edu/courses/example/example.jpg?format=webp&width=1920"
    )
  })

  it("leaves relative gallery images unchanged for offline base URLs", () => {
    expect(
      fastlyOptimizedGalleryUrl("example.jpg", "../../", {
        format: "webp",
        width:  "480"
      })
    ).toBe("example.jpg")
  })
})
