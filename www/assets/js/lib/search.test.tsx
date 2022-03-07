import {
  INITIAL_FACET_STATE,
  LearningResourceType
} from "@mitodl/course-search-utils/dist/constants"
import sinon from "sinon"

import {
  CONTENT_TYPE_PAGE,
  CONTENT_TYPE_PDF,
  CONTENT_TYPE_VIDEO
} from "./constants"

import {
  buildSearchQuery,
  buildSuggestQuery,
  getCoverImageUrl,
  getResourceUrl,
  getResultUrl,
  getSectionUrl,
  LEARN_SUGGEST_FIELDS,
  RESOURCE_QUERY_NESTED_FIELDS,
  RESOURCEFILE_QUERY_FIELDS,
  searchFields,
  courseJSONToLearningResource
} from "./search"
import { makeLearningResourceResult, makeCourseJSON } from "../factories/search"
import { Facets } from "@mitodl/course-search-utils/dist/url_utils"

describe("search library", () => {
  const sandbox = sinon.createSandbox()
  let activeFacets: Facets

  beforeEach(() => {
    activeFacets = {
      ...INITIAL_FACET_STATE,
      type: [LearningResourceType.Course]
    }
  })

  afterEach(() => {
    sandbox.restore()
  })

  it("form a basic text query", () => {
    // @ts-ignore
    const { query } = buildSearchQuery({
      text: "Dogs are the best",
      activeFacets
    })
    const repeatedPart = {
      should: [
        {
          multi_match: {
            query:  "Dogs are the best",
            fields: searchFields(LearningResourceType.Course)
          }
        },
        {
          wildcard: {
            coursenum: {
              boost:   100,
              rewrite: "constant_score",
              value:   "DOGS ARE THE BEST*"
            }
          }
        },
        {
          nested: {
            path:  "runs",
            query: {
              multi_match: {
                query:  "Dogs are the best",
                fields: RESOURCE_QUERY_NESTED_FIELDS
              }
            }
          }
        },
        {
          has_child: {
            type:  "resourcefile",
            query: {
              multi_match: {
                query:  "Dogs are the best",
                fields: RESOURCEFILE_QUERY_FIELDS
              }
            },
            score_mode: "avg"
          }
        }
      ]
    }

    expect(query).toStrictEqual({
      bool: {
        should: [
          {
            bool: {
              filter: {
                bool: {
                  must: [
                    {
                      term: {
                        object_type: LearningResourceType.Course
                      }
                    },
                    {
                      bool: repeatedPart
                    }
                  ]
                }
              },
              ...repeatedPart
            }
          }
        ]
      }
    })
  })

  it("should do a nested query for level", () => {
    activeFacets["level"] = ["Undergraduate"]
    // @ts-ignore eslint-disable-next-line camelcase
    const { query, post_filter, aggs } = buildSearchQuery({
      text: "",
      activeFacets
    })
    expect(query).toStrictEqual({
      bool: {
        should: [
          {
            bool: {
              filter: {
                bool: {
                  must: [
                    {
                      term: {
                        object_type: LearningResourceType.Course
                      }
                    }
                  ]
                }
              }
            }
          }
        ]
      }
    })

    // this is the part of aggregation specific to the nesting
    expect(aggs.agg_filter_level.aggs).toStrictEqual({
      level: {
        aggs: {
          level: {
            aggs: {
              courses: {
                reverse_nested: {}
              }
            },
            terms: {
              field: "runs.level",
              size:  10000
            }
          }
        },
        nested: {
          path: "runs"
        }
      }
    })

    expect(post_filter).toStrictEqual({
      bool: {
        must: [
          {
            bool: {
              should: [
                {
                  term: {
                    offered_by: "OCW"
                  }
                }
              ]
            }
          },
          {
            bool: {
              should: [
                {
                  term: {
                    "object_type.keyword": "course"
                  }
                }
              ]
            }
          },
          {
            bool: {
              should: [
                {
                  nested: {
                    path:  "runs",
                    query: {
                      match: {
                        "runs.level": "Undergraduate"
                      }
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    })
  })

  it("should include an appropriate resource query and aggregation for resource_type ", () => {
    // @ts-ignore eslint-disable-next-line camelcase
    const { query, post_filter, aggs } = buildSearchQuery({
      text:         "",
      activeFacets: {
        ...INITIAL_FACET_STATE,
        resource_type: ["Exams"],
        type:          [LearningResourceType.ResourceFile]
      }
    })

    expect(query).toStrictEqual({
      bool: {
        should: [
          {
            bool: {
              filter: {
                bool: {
                  must: [
                    {
                      term: {
                        object_type: LearningResourceType.ResourceFile
                      }
                    }
                  ]
                }
              }
            }
          }
        ]
      }
    })

    expect(aggs.agg_filter_resource_type.aggs).toStrictEqual({
      resource_type: {
        terms: {
          field: "resource_type",
          size:  10000
        }
      }
    })

    expect(post_filter).toStrictEqual({
      bool: {
        must: [
          {
            bool: {
              should: [
                {
                  has_parent: {
                    parent_type: "resource",
                    query:       {
                      bool: {
                        should: [
                          {
                            term: {
                              offered_by: "OCW"
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },
          {
            bool: {
              should: [
                {
                  term: {
                    "object_type.keyword": LearningResourceType.ResourceFile
                  }
                }
              ]
            }
          },
          {
            bool: {
              should: [
                {
                  term: {
                    resource_type: "Exams"
                  }
                }
              ]
            }
          }
        ]
      }
    })
  })

  it("should include suggest query, if text", () => {
    expect(
      // @ts-ignore
      buildSearchQuery({ text: "text!", activeFacets }).suggest
    ).toStrictEqual(buildSuggestQuery("text!", LEARN_SUGGEST_FIELDS))
    // @ts-ignore
    expect(buildSearchQuery({ activeFacets }).suggest).toBeUndefined()
  })

  it("should set from, size values", () => {
    // @ts-ignore
    const query = buildSearchQuery({ from: 10, size: 100, activeFacets })
    // @ts-ignore
    expect(query.from).toBe(10)
    // @ts-ignore
    expect(query.size).toBe(100)
  })

  //
  ;[
    [null, LearningResourceType.Course, undefined, []],
    [undefined, LearningResourceType.Course, undefined, []],
    [
      { field: "nested.field", option: "desc" },
      LearningResourceType.ResourceFile,
      undefined,
      []
    ],
    [
      { field: "nested.field", option: "desc" },
      LearningResourceType.Course,
      [{ "nested.field": { order: "desc", nested: { path: "nested" } } }],
      []
    ],
    [
      { field: "department_course_numbers.sort_coursenum", option: "asc" },
      LearningResourceType.Course,
      [
        {
          "department_course_numbers.sort_coursenum": {
            nested: {
              filter: {
                term: {
                  "department_course_numbers.primary": true
                }
              },
              path: "department_course_numbers"
            },
            order: "asc"
          }
        }
      ],
      []
    ],
    [
      { field: "department_course_numbers.sort_coursenum", option: "asc" },
      LearningResourceType.Course,
      [
        {
          "department_course_numbers.sort_coursenum": {
            nested: {
              filter: {
                bool: {
                  should: [
                    {
                      term: {
                        "department_course_numbers.department": "Physics"
                      }
                    }
                  ]
                }
              },
              path: "department_course_numbers"
            },
            order: "asc"
          }
        }
      ],
      ["Physics"]
    ],
    [
      { field: "department_course_numbers.sort_coursenum", option: "asc" },
      LearningResourceType.ResourceFile,
      undefined,
      []
    ]
  ].forEach(([sortField, type, expectedSort, departmentFilter]) => {
    it(`should add a sort option if field is ${JSON.stringify(
      sortField
    )} and type is ${type}`, () => {
      // @ts-ignore
      activeFacets["type"] = [type]
      // @ts-ignore
      activeFacets["department_name"] = departmentFilter
      // @ts-ignore
      const query = buildSearchQuery({ sort: sortField, activeFacets })
      // @ts-ignore
      expect(query.sort).toStrictEqual(expectedSort)
    })
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
          // @ts-ignore
          expect(getCoverImageUrl(result)).toBe(expectedSrc)
        })
      }
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
      // @ts-ignore
      process.env["CDN_PREFIX"] = cdnPrefix
      const result = {
        ...makeLearningResourceResult(LearningResourceType.ResourceFile),
        url,
        run_slug:     "run-slug",
        content_type: contentType
      }
      // @ts-ignore
      expect(getResourceUrl(result)).toBe(expectedUrl)
    })
  })

  //
  ;[LearningResourceType.Course, LearningResourceType.ResourceFile].forEach(
    objectType => {
      it(`should return correct url for object type ${objectType}`, () => {
        const isCourse = objectType === LearningResourceType.Course
        // @ts-ignore
        const result = makeLearningResourceResult(objectType)
        if (!isCourse) {
          // @ts-ignore
          result.content_type = CONTENT_TYPE_PAGE
        } else {
          // @ts-ignore
          result.runs[0].best_start_date = "2001-11-11"
          // @ts-ignore
          result.runs[1].published = false
          // @ts-ignore
          result.runs[2].best_start_date = "2002-01-01"
        }
        const expected = isCourse ? // @ts-ignore
          `/courses/${result.runs[2].slug}/` : // @ts-ignore
          `/courses/${result.run_slug}${getSectionUrl(result)}`
        expect(getResultUrl(result)).toBe(expected)
      })
    }
  )

  it(`should return a null url for a course without runs`, () => {
    const result = makeLearningResourceResult(LearningResourceType.Course)
    result.runs = []
    expect(getResultUrl(result)).toBe(null)
    // @ts-ignore
    result.runs = null
    expect(getResultUrl(result)).toBe(null)
    // @ts-ignore
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

  it("should let you convert a CourseJSON record to a LearningResource", () => {
    const lr = courseJSONToLearningResource(
      "course-name-i-made-up",
      makeCourseJSON()
    )
    expect(lr.url).toBe("/courses/course-name-i-made-up/")
  })
})
