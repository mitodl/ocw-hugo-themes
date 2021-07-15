import bodybuilder from "bodybuilder"

import { emptyOrNil } from "./util"
import {
  LR_TYPE_COURSE,
  LR_TYPE_VIDEO,
  LR_TYPE_PODCAST,
  LR_TYPE_PODCAST_EPISODE,
  LR_TYPE_RESOURCEFILE,
  OCW_PLATFORM,
  CONTENT_TYPE_PAGE,
  CONTENT_TYPE_PDF,
  CONTENT_TYPE_VIDEO
} from "./constants"

export const LEARN_SUGGEST_FIELDS = [
  "title.trigram",
  "short_description.trigram"
]

const OBJECT_TYPE = "type"

export const RESOURCE_QUERY_NESTED_FIELDS = [
  "runs.year",
  "runs.semester",
  "runs.level",
  "runs.instructors^5",
  "department_name"
]

export const RESOURCEFILE_QUERY_FIELDS = [
  "content",
  "title",
  "short_description",
  "department_name",
  "resource_type"
]

export const searchFields = type => {
  if (type === LR_TYPE_COURSE) {
    return COURSE_QUERY_FIELDS
  } else if (type === LR_TYPE_VIDEO) {
    return VIDEO_QUERY_FIELDS
  } else if (type === LR_TYPE_PODCAST) {
    return PODCAST_QUERY_FIELDS
  } else if (type === LR_TYPE_PODCAST_EPISODE) {
    return PODCAST_EPISODE_QUERY_FIELDS
  } else if (type === LR_TYPE_RESOURCEFILE) {
    return RESOURCEFILE_QUERY_FIELDS
  } else {
    return LIST_QUERY_FIELDS
  }
}

const PODCAST_QUERY_FIELDS = [
  "title.english^3",
  "short_description.english^2",
  "full_description.english",
  "topics"
]

const PODCAST_EPISODE_QUERY_FIELDS = [
  "title.english^3",
  "short_description.english^2",
  "full_description.english",
  "topics",
  "series_title^2"
]

const COURSE_QUERY_FIELDS = [
  "title.english^3",
  "short_description.english^2",
  "full_description.english",
  "topics",
  "platform",
  "course_id",
  "coursenum^5",
  "offered_by",
  "department_name",
  "course_feature_tags"
]
const VIDEO_QUERY_FIELDS = [
  "title.english^3",
  "short_description.english^2",
  "full_description.english",
  "transcript.english^2",
  "topics",
  "platform",
  "video_id",
  "offered_by"
]

const LIST_QUERY_FIELDS = [
  "title.english^3",
  "short_description.english^2",
  "topics"
]

export const isDoubleQuoted = string => /^".+"$/.test(string)

export const buildSearchQuery = ({ text, from, size, sort, activeFacets }) => {
  let builder = bodybuilder()

  if (from !== undefined) {
    builder = builder.from(from)
  }
  if (size !== undefined) {
    builder = builder.size(size)
  }
  if (sort && !activeFacets.type.includes(LR_TYPE_RESOURCEFILE)) {
    const { field, option } = sort
    if (field.includes(".")) {
      const fieldPieces = field.split(".")
      builder.sort(field, {
        order:  option,
        nested: {
          path: fieldPieces[0]
        }
      })
    } else {
      builder.sort(field, option)
    }
  }

  for (const type of activeFacets.type) {
    const queryType = isDoubleQuoted(text) ? "query_string" : "multi_match"
    const textQuery = emptyOrNil(text) ?
      {} :
      {
        should: [
          {
            [queryType]: {
              query:  text,
              fields: searchFields(type)
            }
          },
          type === LR_TYPE_COURSE ?
            [
              {
                nested: {
                  path:  "runs",
                  query: {
                    [queryType]: {
                      query:  text,
                      fields: RESOURCE_QUERY_NESTED_FIELDS
                    }
                  }
                }
              },
              {
                has_child: {
                  type:  "resourcefile",
                  query: {
                    [queryType]: {
                      query:  text,
                      fields: RESOURCEFILE_QUERY_FIELDS
                    }
                  },
                  score_mode: "avg"
                }
              }
            ] :
            null
        ]
          .flat()
          .filter(clause => clause !== null)
      }

    // buildFacetSubQuery
    const facets = {
      ...activeFacets,
      offered_by: [OCW_PLATFORM]
    }

    const facetClauses = buildFacetSubQuery(facets, builder, type)

    // buildOrQuery
    builder = buildOrQuery(builder, type, textQuery, [])
    builder = builder.rawOption("post_filter", {
      bool: {
        must: [...facetClauses]
      }
    })

    // Include suggest if search test is not null/empty
    if (!emptyOrNil(text)) {
      builder = builder.rawOption(
        "suggest",
        // $FlowFixMe: if we get this far, text is not null
        buildSuggestQuery(text, LEARN_SUGGEST_FIELDS)
      )
    } else if (facetClauses.length === 0) {
      builder = builder.rawOption("sort", buildDefaultSort())
    }
  }

  return builder.build()
}

const buildLevelQuery = (builder, values, facetClauses) => {
  if (values && values.length > 0) {
    const facetFilter = values.map(value => ({
      nested: {
        path:  "runs",
        query: {
          match: {
            "runs.level": value
          }
        }
      }
    }))
    facetClauses.push({
      bool: {
        should: facetFilter
      }
    })
  }
}

export const buildFacetSubQuery = (facets, builder, objectType) => {
  const facetClauses = []
  if (facets) {
    Object.entries(facets).forEach(([key, values]) => {
      const facetClausesForFacet = []

      if (values && values.length > 0) {
        if (key === "level") {
          buildLevelQuery(builder, values, facetClauses)
        } else {
          addFacetClauseToArray(facetClauses, key, values, objectType)
        }
      }

      // $FlowFixMe: we check for null facets earlier
      Object.entries(facets).forEach(([otherKey, otherValues]) => {
        if (otherKey !== key && otherValues && otherValues.length > 0) {
          if (otherKey === "level") {
            buildLevelQuery(builder, otherValues, facetClausesForFacet)
          } else {
            addFacetClauseToArray(
              facetClausesForFacet,
              otherKey,
              otherValues,
              objectType
            )
          }
        }
      })

      if (facetClausesForFacet.length > 0) {
        const filter = {
          filter: {
            bool: {
              must: [...facetClausesForFacet]
            }
          }
        }

        if (key === "level") {
          // this is done seperately b/c it's a nested field
          builder.agg("filter", key, aggr =>
            aggr
              .orFilter("bool", filter)
              .agg("nested", { path: "runs" }, "level", aggr =>
                aggr.agg(
                  "terms",
                  "runs.level",
                  { size: 10000 },
                  "level",
                  aggr => aggr.agg("reverse_nested", null, {}, "courses")
                )
              )
          )
        } else {
          builder.agg("filter", key, aggregation =>
            aggregation
              .orFilter("bool", filter)
              .agg(
                "terms",
                key === OBJECT_TYPE ? "object_type.keyword" : key,
                { size: 10000 },
                key
              )
          )
        }
      } else {
        if (key === "level") {
          // this is done seperately b/c it's a nested field
          builder.agg("nested", { path: "runs" }, "level", aggr =>
            aggr.agg(
              "terms",
              "runs.level",
              {
                size: 10000
              },
              "level",
              aggr => aggr.agg("reverse_nested", null, {}, "courses")
            )
          )
        } else {
          builder.agg(
            "terms",
            key === OBJECT_TYPE ? "object_type.keyword" : key,
            { size: 10000 },
            key
          )
        }
      }
    })
  }
  return facetClauses
}

export const buildOrQuery = (builder, searchType, textQuery, extraClauses) => {
  const textFilter = emptyOrNil(textQuery) ? [] : [{ bool: textQuery }]

  builder = builder.orQuery("bool", {
    filter: {
      bool: {
        must: [
          {
            term: {
              object_type: searchType
            }
          },
          ...extraClauses,
          // Add multimatch text query here to filter out non-matching results
          ...textFilter
        ]
      }
    },
    // Add multimatch text query here again to score results based on match
    ...textQuery
  })
  return builder
}

const addFacetClauseToArray = (facetClauses, facet, values, type) => {
  if (
    facet === OBJECT_TYPE &&
    values.toString() === buildSearchQuery.toString()
  ) {
    return
  }

  const filterKey = facet === OBJECT_TYPE ? "object_type.keyword" : facet
  let valueClauses
  // Apply standard facet clause unless this is an offered_by facet for resources.
  if (facet !== "offered_by" || type !== LR_TYPE_RESOURCEFILE) {
    valueClauses = values.map(value => ({
      term: {
        [filterKey]: value
      }
    }))
  } else {
    // offered_by facet should apply to parent doc of resource
    valueClauses = [
      {
        has_parent: {
          parent_type: "resource",
          query:       {
            bool: {
              should: values.map(value => ({
                term: {
                  [filterKey]: value
                }
              }))
            }
          }
        }
      }
    ]
  }

  facetClauses.push({
    bool: {
      should: valueClauses
    }
  })
}

export const buildSuggestQuery = (text, suggestFields) => {
  const suggest = {
    text
  }
  suggestFields.forEach(
    field =>
      // $FlowFixMe: yes the fields are missing and I'm adding them
      (suggest[field] = {
        phrase: {
          field:      `${field}`,
          size:       5,
          gram_size:  1,
          confidence: 0.0001,
          max_errors: 3,
          collate:    {
            query: {
              source: {
                match_phrase: {
                  "{{field_name}}": "{{suggestion}}"
                }
              }
            },
            params: { field_name: `${field}` },
            prune:  true
          }
        }
      })
  )
  return suggest
}

export const buildDefaultSort = () => {
  return [
    { minimum_price: { order: "asc" } },
    { default_search_priority: { order: "desc" } },
    { created: { order: "desc" } }
  ]
}

export const SEARCH_GRID_UI = "grid"
export const SEARCH_LIST_UI = "list"

export const searchResultToLearningResource = result => ({
  id:                  result.id,
  title:               result.title,
  image_src:           result.image_src,
  object_type:         result.object_type,
  platform:            "platform" in result ? result.platform : null,
  topics:              result.topics ? result.topics.map(topic => ({ name: topic })) : [],
  runs:                "runs" in result ? result.runs : [],
  level:               !emptyOrNil(result.runs) ? result.runs[0].level : null,
  instructors:         !emptyOrNil(result.runs) ? result.runs[0].instructors : [],
  department:          result.department,
  audience:            result.audience,
  certification:       result.certification,
  content_title:       result.content_title,
  run_title:           result.run_title || null,
  run_slug:            result.run_slug || null,
  content_type:        result.content_type || null,
  url:                 getResultUrl(result) || null,
  short_url:           result.short_url || null,
  course_id:           result.course_id || null,
  coursenum:           result.coursenum || null,
  description:         result.short_description || null,
  course_feature_tags: result.course_feature_tags ?
    result.course_feature_tags :
    []
})

export const getCoverImageUrl = result => {
  if (!emptyOrNil(result.image_src)) {
    return result.image_src
  } else {
    return `/images/${result.content_type}_thumbnail.png`
  }
}

export const getCourseUrl = result => {
  if (emptyOrNil(result.runs)) {
    return null
  }
  const publishedRuns = result.runs.filter(run => run.published)
  return !emptyOrNil(publishedRuns) ?
    `/courses/${
      publishedRuns.sort((a, b) =>
        a.best_start_date < b.best_start_date ? 1 : -1
      )[0].slug
    }/` :
    null
}

export const getSectionUrl = result => {
  let url = result.url
  // a small number of urls still start with the legacy site prefix
  const legacyPrefix = "http://ocw.mit.edu"
  if (url.startsWith(legacyPrefix)) {
    url = url.slice(legacyPrefix.length)
  }

  // cut off the /courses or /resources part, and the course id too
  const urlPieces = url.split("/").slice(4)
  const lastPiece = urlPieces[urlPieces.length - 1]
  if (lastPiece === "index.htm" || lastPiece === "index.html") {
    urlPieces[urlPieces.length - 1] = ""
  }
  if (
    urlPieces.length === 0 ||
    (urlPieces.length === 1 && urlPieces[0] === "")
  ) {
    return "/"
  }
  return `/sections/${urlPieces.join("/")}`
}

export const getResourceUrl = result => {
  if (result.content_type === CONTENT_TYPE_PAGE) {
    // parse the url to get section pieces, then construct a new section url
    const sectionUrl = getSectionUrl(result)
    return `/courses/${result.run_slug}${sectionUrl}`
  } else {
    // Non-page results should have full URLs, convert to CDN if it's an S3 URL
    try {
      const originalUrl = new URL(result.url)
      const cdnPrefix = process.env["CDN_PREFIX"]
      const useCDN =
        originalUrl.hostname.match(/s3\.amazonaws\.com/) && cdnPrefix
      return useCDN ? `${cdnPrefix}${originalUrl.pathname}` : result.url
    } catch {
      return result.url
    }
  }
}
export const getResultUrl = result =>
  result.object_type === LR_TYPE_COURSE ?
    getCourseUrl(result) :
    getResourceUrl(result)

export const getContentIcon = contentType => {
  switch (contentType) {
  case CONTENT_TYPE_PDF:
    return "picture_as_pdf"
  case CONTENT_TYPE_VIDEO:
    return "theaters"
  case CONTENT_TYPE_PAGE:
    return "web"
  default:
    return "file_copy"
  }
}
