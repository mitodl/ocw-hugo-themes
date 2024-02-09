import sinon from "sinon"

import {
  CONTENT_TYPE_PAGE,
  CONTENT_TYPE_PDF,
  CONTENT_TYPE_VIDEO
} from "./constants"

import {
  getCoverImageUrl,
  getResourceUrl,
  getCourseUrl,
  getSectionUrl,
  courseJSONToLearningResource,
  courseSearchResultToLearningResource
} from "./search"
import {
  makeCourseSearchResult,
  makeContentFileSearchResult,
  makeCourseJSON
} from "../factories/search"

describe("search library", () => {
  const sandbox = sinon.createSandbox()

  afterEach(() => {
    sandbox.restore()
  })

  //
  ;[true, false].forEach(hasImageSrc => {
    [CONTENT_TYPE_PAGE, CONTENT_TYPE_VIDEO, CONTENT_TYPE_PDF].forEach(
      contentType => {
        const fakeImgSrc = "http://fake/img.jpg"
        const result = {
          image_src:    hasImageSrc ? fakeImgSrc : null,
          content_type: contentType
        }
        it(`should return correct image for result w/content type ${contentType}, image_src ${result.image_src}`, () => {
          const expectedSrc = hasImageSrc ?
            result.image_src :
            `/images/${result.content_type}_thumbnail.png`
          // @ts-expect-error We should loosen the function type or mock the result more
          expect(getCoverImageUrl(result)).toBe(expectedSrc)
        })
      }
    )
  })

  it("getCoverImageUrl should return RESOURCE_BASE_URL+image_src when set", () => {
    const lr = courseSearchResultToLearningResource(makeCourseSearchResult())
    expect(getCoverImageUrl({ ...lr, image_src: "/images/foobar.jpeg" })).toBe(
      "http://resources-galore.example.com/images/foobar.jpeg"
    )
  })

  //
  ;(
    [
      ["", "/courses/18-23/mech_engineering/", null, "/courses/run-slug/"],
      [
        null,
        "/courses/18-23/mech_engineering/",
        "https://cdn.example.com",
        "/courses/run-slug/"
      ],
      [
        "application/pdf",
        "https://s3.amazonaws.com/18-23/test.pdf",
        null,
        "https://s3.amazonaws.com/18-23/test.pdf"
      ],
      [
        "application/pdf",
        "https://s3.amazonaws.com/18-23/test.pdf",
        "https://cdn.example.com",
        "https://cdn.example.com/18-23/test.pdf"
      ],
      [
        "video/mp4",
        "https://youtube.com/?s=2335",
        "",
        "https://youtube.com/?s=2335"
      ],
      [
        "video/quicktime",
        "https://youtube.com/?s=2335",
        "/coursemedia",
        "https://youtube.com/?s=2335"
      ],
      ["video/x-msvideo", "/relative/url", false, "/relative/url"],
      ["video/x-ms-wmv", "/relative/url", "/coursemedia", "/relative/url"]
    ] as const
  ).forEach(([fileType, url, cdnPrefix, expectedUrl]) => {
    it(`should return correct url for file  type ${fileType} if the cdn is ${
      cdnPrefix ? "" : "not "
    }set`, () => {
      // @ts-expect-error See note in test-setup
      process.env["CDN_PREFIX"] = cdnPrefix
      const result = {
        ...makeContentFileSearchResult(),
        url,
        run_slug:  "run-slug",
        file_type: fileType
      }

      expect(getResourceUrl(result)).toBe(expectedUrl)
    })
  })

  it(`should return a null url for a course without runs`, () => {
    const result = makeCourseSearchResult()
    result.runs = []
    expect(getCourseUrl(result)).toBe(null)
    result.runs = null
    expect(getCourseUrl(result)).toBe(null)
  })

  describe("getSectionUrl", () => {
    it("returns a / for a course site", () => {
      const result = {
        ...makeContentFileSearchResult(),
        url: "/courses/course-id/other-course-part/"
      }
      expect(getSectionUrl(result)).toBe("/")
    })

    it("handles a legacy prefix gracefully", () => {
      const result = {
        ...makeContentFileSearchResult(),
        url: "http://ocw.mit.edu/resources/a/resource"
      }
      expect(getSectionUrl(result)).toBe("/")
    })

    //
    ;["index.htm", "index.html"].forEach(suffix => {
      it(`removes a ${suffix} from the path`, () => {
        const result = {
          ...makeContentFileSearchResult(),
          url: `/courses/course-id/other-piece/${suffix}`
        }
        expect(getSectionUrl(result)).toBe("/")
      })
    })

    it("adds a /pages if it is pointing to a section within a course url", () => {
      const result = {
        ...makeContentFileSearchResult(),
        url: "/courses/course-id/other-part/path/to/a/pdf"
      }
      expect(getSectionUrl(result)).toBe("/pages/path/to/a/pdf")
    })
  })

  //
  ;["courses/", ""].forEach(prefix => {
    it("should let you convert a CourseJSON record to a LearningResource", () => {
      const lr = courseJSONToLearningResource(
        `${prefix}course-name-i-made-up`,
        makeCourseJSON()
      )
      expect(lr.url).toBe("/courses/course-name-i-made-up/")
    })
  })
})
