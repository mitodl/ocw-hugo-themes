import { INITIAL_FACET_STATE } from "@mitodl/course-search-utils/dist/constants"
import {
  CONTENT_TYPE_PAGE,
  CONTENT_TYPE_PDF,
  CONTENT_TYPE_VIDEO,
  LR_TYPE_COURSE,
  LR_TYPE_RESOURCEFILE
} from "./constants"

import {
  buildSearchQuery,
  buildSuggestQuery,
  getCoverImageUrl,
  getResourceUrl,
  getResultUrl,
  LEARN_SUGGEST_FIELDS,
  RESOURCE_QUERY_NESTED_FIELDS,
  RESOURCEFILE_QUERY_FIELDS,
  searchFields
} from "./search"
import { makeLearningResourceResult } from "../factories/search"

const activeFacets = {
  ...INITIAL_FACET_STATE,
  type: [LR_TYPE_COURSE]
}

describe("search library", () => {
  it("form a basic text query", () => {
    const { query } = buildSearchQuery({
      text: "Dogs are the best",
      activeFacets
    })
    const repeatedPart = {
      should: [
        {
          multi_match: {
            query:  "Dogs are the best",
            fields: searchFields(LR_TYPE_COURSE)
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
                        object_type: LR_TYPE_COURSE
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
    // eslint-disable-next-line camelcase
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
                        object_type: LR_TYPE_COURSE
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
    // eslint-disable-next-line camelcase
    const { query, post_filter, aggs } = buildSearchQuery({
      text:         "",
      activeFacets: {
        ...INITIAL_FACET_STATE,
        resource_type: ["Exams"],
        type:          [LR_TYPE_RESOURCEFILE]
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
                        object_type: LR_TYPE_RESOURCEFILE
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
                    "object_type.keyword": LR_TYPE_RESOURCEFILE
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
      buildSearchQuery({ text: "text!", activeFacets }).suggest
    ).toStrictEqual(buildSuggestQuery("text!", LEARN_SUGGEST_FIELDS))
    expect(buildSearchQuery({ activeFacets }).suggest).toBeUndefined()
  })

  it("should set from, size values", () => {
    const query = buildSearchQuery({ from: 10, size: 100, activeFacets })
    expect(query.from).toBe(10)
    expect(query.size).toBe(100)
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
          expect(getCoverImageUrl(result)).toBe(expectedSrc)
        })
      }
    )
  })

  //
  ;[
    [
      CONTENT_TYPE_PAGE,
      "18-23",
      "mech_engineering",
      null,
      "/courses/18-23/sections/mech_engineering/"
    ],
    [
      CONTENT_TYPE_PAGE,
      "18-23",
      "mech_engineering",
      "https://cdn.example.com",
      "/courses/18-23/sections/mech_engineering/"
    ],
    [
      CONTENT_TYPE_PDF,
      "https://s3.amazonaws.com/18-23/test.pdf",
      "shortlink1",
      null,
      "https://s3.amazonaws.com/18-23/test.pdf"
    ],
    [
      CONTENT_TYPE_PDF,
      "https://s3.amazonaws.com/18-23/test.pdf",
      "shortlink1",
      "https://cdn.example.com",
      "https://cdn.example.com/18-23/test.pdf"
    ],
    [
      CONTENT_TYPE_VIDEO,
      "https://youtube.com/?s=2335",
      null,
      "",
      "https://youtube.com/?s=2335"
    ],
    [
      CONTENT_TYPE_VIDEO,
      "https://youtube.com/?s=2335",
      null,
      "/coursemedia",
      "https://youtube.com/?s=2335"
    ],
    [CONTENT_TYPE_VIDEO, "/relative/url", null, false, "/relative/url"],
    [CONTENT_TYPE_VIDEO, "/relative/url", null, "/coursemedia", "/relative/url"]
  ].forEach(([contentType, url, shortUrl, cdnPrefix, expectedUrl]) => {
    it(`should return correct url for content type ${contentType} if the cdn is ${
      cdnPrefix ? "" : "not "
    }set`, () => {
      process.env["CDN_PREFIX"] = cdnPrefix
      const result = {
        url,
        short_url:    shortUrl,
        run_slug:     url,
        content_type: contentType
      }
      expect(getResourceUrl(result)).toBe(expectedUrl)
    })
  })

  //
  ;[LR_TYPE_COURSE, LR_TYPE_RESOURCEFILE].forEach(objectType => {
    it(`should return correct url for object type ${objectType}`, () => {
      const isCourse = objectType === LR_TYPE_COURSE
      const result = makeLearningResourceResult(objectType)
      if (!isCourse) {
        result.content_type = CONTENT_TYPE_PAGE
      } else {
        result.runs[0].best_start_date = "2001-11-11"
        result.runs[1].published = false
        result.runs[2].best_start_date = "2002-01-01"
      }
      const expected = isCourse ?
        `/courses/${result.runs[2].slug}/` :
        `/courses/${result.run_slug}/sections/${result.short_url}/`
      expect(getResultUrl(result)).toBe(expected)
    })
  })

  it(`should return a null url for a course without runs`, () => {
    const result = makeLearningResourceResult("course")
    result.runs = []
    expect(getResultUrl(result)).toBe(null)
    result.runs = null
    expect(getResultUrl(result)).toBe(null)
    delete result.runs
    expect(getResultUrl(result)).toBe(null)
  })
})
