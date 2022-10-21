import { LearningResourceType } from "@mitodl/course-search-utils"
import sinon from "sinon"

import {
  CONTENT_TYPE_PAGE,
  CONTENT_TYPE_PDF,
  CONTENT_TYPE_VIDEO
} from "./constants"

import {
  getCoverImageUrl,
  getResourceUrl,
  getResultUrl,
  getSectionUrl,
  courseJSONToLearningResource,
  searchResultToLearningResource
} from "./search"
import { makeLearningResourceResult, makeCourseJSON } from "../factories/search"

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
          // @ts-expect-error TODO
          expect(getCoverImageUrl(result)).toBe(expectedSrc)
        })
      }
    )
  })

  it("getCoverImageUrl should return RESOURCE_BASE_URL+image_src when set", () => {
    const lr = searchResultToLearningResource(
      makeLearningResourceResult(LearningResourceType.Course)
    )
    expect(getCoverImageUrl({ ...lr, image_src: "/images/foobar.jpeg" })).toBe(
      "http://resources-galore.example.com/images/foobar.jpeg"
    )
  })

  //
  ;[
    [
      CONTENT_TYPE_PAGE,
      "/courses/18-23/mech_engineering/",
      null,
      "/courses/run-slug/"
    ],
    [
      CONTENT_TYPE_PAGE,
      "/courses/18-23/mech_engineering/",
      "https://cdn.example.com",
      "/courses/run-slug/"
    ],
    [
      CONTENT_TYPE_PDF,
      "https://s3.amazonaws.com/18-23/test.pdf",
      null,
      "https://s3.amazonaws.com/18-23/test.pdf"
    ],
    [
      CONTENT_TYPE_PDF,
      "https://s3.amazonaws.com/18-23/test.pdf",
      "https://cdn.example.com",
      "https://cdn.example.com/18-23/test.pdf"
    ],
    [
      CONTENT_TYPE_VIDEO,
      "https://youtube.com/?s=2335",
      "",
      "https://youtube.com/?s=2335"
    ],
    [
      CONTENT_TYPE_VIDEO,
      "https://youtube.com/?s=2335",
      "/coursemedia",
      "https://youtube.com/?s=2335"
    ],
    [CONTENT_TYPE_VIDEO, "/relative/url", false, "/relative/url"],
    [CONTENT_TYPE_VIDEO, "/relative/url", "/coursemedia", "/relative/url"]
  ].forEach(([contentType, url, cdnPrefix, expectedUrl]) => {
    it(`should return correct url for content type ${contentType} if the cdn is ${
      cdnPrefix ? "" : "not "
    }set`, () => {
      // @ts-expect-error TODO
      process.env["CDN_PREFIX"] = cdnPrefix
      const result = {
        ...makeLearningResourceResult(LearningResourceType.ResourceFile),
        url,
        run_slug:     "run-slug",
        content_type: contentType
      }
      // @ts-expect-error TODO
      expect(getResourceUrl(result)).toBe(expectedUrl)
    })
  })

  //
  ;[LearningResourceType.Course, LearningResourceType.ResourceFile].forEach(
    objectType => {
      it(`should return correct url for object type ${objectType}`, () => {
        const isCourse = objectType === LearningResourceType.Course
        // @ts-expect-error TODO
        const result = makeLearningResourceResult(objectType)
        if (!isCourse) {
          // @ts-expect-error TODO
          result.content_type = CONTENT_TYPE_PAGE
        } else {
          // @ts-expect-error TODO
          result.runs[0].best_start_date = "2001-11-11"
          // @ts-expect-error TODO
          result.runs[1].published = false
          // @ts-expect-error TODO
          result.runs[2].best_start_date = "2002-01-01"
        }
        const expected = isCourse ? // @ts-expect-error TODO
          `/courses/${result.runs[2].slug}/` : // @ts-expect-error TODO
          `/courses/${result.run_slug}${getSectionUrl(result)}`
        expect(getResultUrl(result)).toBe(expected)
      })
    }
  )

  it(`should return a null url for a course without runs`, () => {
    const result = makeLearningResourceResult(LearningResourceType.Course)
    result.runs = []
    expect(getResultUrl(result)).toBe(null)
    // @ts-expect-error TODO
    result.runs = null
    expect(getResultUrl(result)).toBe(null)
    // @ts-expect-error TODO
    delete result.runs
    expect(getResultUrl(result)).toBe(null)
  })

  describe("getSectionUrl", () => {
    it("returns a / for a course site", () => {
      const result = {
        ...makeLearningResourceResult(LearningResourceType.Course),
        url: "/courses/course-id/other-course-part/"
      }
      expect(getSectionUrl(result)).toBe("/")
    })

    it("handles a legacy prefix gracefully", () => {
      const result = {
        ...makeLearningResourceResult(LearningResourceType.Course),
        url: "http://ocw.mit.edu/resources/a/resource"
      }
      expect(getSectionUrl(result)).toBe("/")
    })

    //
    ;["index.htm", "index.html"].forEach(suffix => {
      it(`removes a ${suffix} from the path`, () => {
        const result = {
          ...makeLearningResourceResult(LearningResourceType.Course),
          url: `/courses/course-id/other-piece/${suffix}`
        }
        expect(getSectionUrl(result)).toBe("/")
      })
    })

    it("adds a /pages if it is pointing to a section within a course url", () => {
      const result = {
        ...makeLearningResourceResult(LearningResourceType.Course),
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
