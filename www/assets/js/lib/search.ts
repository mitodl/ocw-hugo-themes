import bodybuilder, { Bodybuilder } from "bodybuilder"

import { emptyOrNil } from "./util"
import {
  OCW_PLATFORM,
  CONTENT_TYPE_PAGE,
  CONTENT_TYPE_PDF,
  CONTENT_TYPE_VIDEO,
  COURSENUM_SORT_FIELD,
  ContentType
} from "./constants"
import {
  Facets,
  SortParam,
  LearningResourceType
} from "@mitodl/course-search-utils"
import {
  CourseResult,
  CourseRun,
  CourseJSON,
  LearningResource,
  LearningResourceResult,
  Level,
  ResourceJSON
} from "../LearningResources"

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
  "title.english^3",
  "short_description.english^2",
  "department_name",
  "resource_type"
]

export const searchFields = (type: LearningResourceType): string[] => {
  switch (type) {
    case LearningResourceType.Course:
      return COURSE_QUERY_FIELDS
    case LearningResourceType.Video:
      return VIDEO_QUERY_FIELDS
    case LearningResourceType.Podcast:
      return PODCAST_QUERY_FIELDS
    case LearningResourceType.PodcastEpisode:
      return PODCAST_EPISODE_QUERY_FIELDS
    case LearningResourceType.ResourceFile:
      return RESOURCEFILE_QUERY_FIELDS
    default:
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

export const isDoubleQuoted = (str: string) => /^".+"$/.test(str)

export interface SearchQueryParams {
  text: string
  from?: number
  size?: number
  sort?: SortParam
  activeFacets?: Facets
  ui?: string
}

export const buildSearchQuery = ({
  text,
  from,
  size,
  sort,
  activeFacets
}: SearchQueryParams) => {
  let builder = bodybuilder()

  if (from !== undefined) {
    builder = builder.from(from)
  }
  if (size !== undefined) {
    builder = builder.size(size)
  }

  if (
    sort &&
    activeFacets &&
    !(activeFacets.type ?? []).includes(LearningResourceType.ResourceFile)
  ) {
    const { field, option } = sort
    const fieldPieces = field.split(".")

    const sortQuery = {
      order: option,
      nested: {
        path: fieldPieces[0]
      }
    }

    if (field === COURSENUM_SORT_FIELD) {
      if ((activeFacets.department_name ?? []).length === 0) {
        // @ts-ignore
        sortQuery["nested"]["filter"] = {
          term: {
            "department_course_numbers.primary": true
          }
        }
      } else {
        const filterClause: any[] = []
        addFacetClauseToArray(
          filterClause,
          "department_course_numbers.department",
          activeFacets.department_name || [],
          LearningResourceType.Course
        )
        // @ts-ignore
        sortQuery["nested"]["filter"] = filterClause[0]
      }
    }

    builder.sort(field, sortQuery)
  }

  if (activeFacets) {
    for (const type of activeFacets.type ?? []) {
      const queryType = isDoubleQuoted(text) ? "query_string" : "multi_match"
      const textQuery = emptyOrNil(text)
        ? {}
        : {
            should: [
              {
                [queryType]: {
                  query: text,
                  fields: searchFields(type as LearningResourceType)
                }
              },
              {
                wildcard: {
                  coursenum: {
                    value: `${text.toUpperCase()}*`,
                    boost: 100.0,
                    rewrite: "constant_score"
                  }
                }
              },
              type === LearningResourceType.Course
                ? [
                    {
                      nested: {
                        path: "runs",
                        query: {
                          [queryType]: {
                            query: text,
                            fields: RESOURCE_QUERY_NESTED_FIELDS
                          }
                        }
                      }
                    },
                    {
                      has_child: {
                        type: "resourcefile",
                        query: {
                          [queryType]: {
                            query: text,
                            fields: RESOURCEFILE_QUERY_FIELDS
                          }
                        },
                        score_mode: "avg"
                      }
                    }
                  ]
                : null
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
  }

  return builder.build()
}

interface LevelFilter {
  nested: {
    path: "runs"
    query: {
      match: {
        "runs.level": Level
      }
    }
  }
}

const buildLevelQuery = (
  _builder: Bodybuilder,
  values: Level[],
  facetClauses: any
) => {
  if (values && values.length > 0) {
    const facetFilter: LevelFilter[] = values.map(value => ({
      nested: {
        path: "runs",
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

export const buildFacetSubQuery = (
  facets: Facets,
  builder: Bodybuilder,
  objectType: string
) => {
  const facetClauses: object[] = []
  if (facets) {
    Object.entries(facets).forEach(([key, values]) => {
      const facetClausesForFacet: object[] = []

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
                  aggr => aggr.agg("reverse_nested", null as any, {}, "courses")
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
              aggr => aggr.agg("reverse_nested", null as any, {}, "courses")
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

export const buildOrQuery = (
  builder: Bodybuilder,
  searchType: string,
  textQuery: object | undefined,
  extraClauses: object[]
) => {
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

const addFacetClauseToArray = (
  facetClauses: object[],
  facet: string,
  values: string[],
  type: string
) => {
  if (
    facet === OBJECT_TYPE &&
    values.toString() === buildSearchQuery.toString()
  ) {
    return
  }

  const filterKey = facet === OBJECT_TYPE ? "object_type.keyword" : facet
  let valueClauses
  // Apply standard facet clause unless this is an offered_by facet for resources.
  if (facet !== "offered_by" || type !== LearningResourceType.ResourceFile) {
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
          query: {
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

export const buildSuggestQuery = (
  text: string,
  suggestFields: string[]
): object => {
  const suggest: any = {
    text
  }
  suggestFields.forEach(
    field =>
      (suggest[field] = {
        phrase: {
          field: `${field}`,
          size: 5,
          gram_size: 1,
          confidence: 0.0001,
          max_errors: 3,
          collate: {
            query: {
              source: {
                match_phrase: {
                  "{{field_name}}": "{{suggestion}}"
                }
              }
            },
            params: { field_name: `${field}` },
            prune: true
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

const formatCourseJSONTopics = (courseJSON: CourseJSON) =>
  courseJSON.topics
    ? Array.from(new Set(courseJSON.topics.flat())).map(topic => ({
        name: topic
      }))
    : []

export const courseJSONToLearningResource = (
  name: string,
  courseData: CourseJSON
): LearningResource => ({
  id: courseData.site_uid || courseData.legacy_uid,
  title: courseData.course_title,
  image_src: courseData.image_src,
  object_type: LearningResourceType.Course,
  platform: OCW_PLATFORM,
  topics: formatCourseJSONTopics(courseData),
  runs: [],
  level: courseData.level,
  instructors: courseData.instructors.map(instructor => instructor.title),
  department: courseData.department_numbers.join(" "),
  audience: undefined,
  certification: undefined,
  content_title: undefined,
  run_title: null,
  run_slug: null,
  content_type: null,
  // a temporary hack to handle runs possibly including the "courses" prefix
  url: name.includes("courses/") ? `/${name}/` : `/courses/${name}/`,
  short_url: null,
  course_id: courseData.site_uid || courseData.legacy_uid,
  coursenum: courseData.primary_course_number,
  description: courseData.course_description,
  course_feature_tags: []
})

const fileTypeToContentType = (mimeType: string): ContentType => {
  switch (mimeType) {
    case "application/pdf":
      return CONTENT_TYPE_PDF
    case "video/x-msvideo":
    case "video/quicktime":
    case "video/mpeg":
    case "video/mp4":
    case "video/x-ms-wmv":
      return CONTENT_TYPE_VIDEO
    default:
      return CONTENT_TYPE_PAGE
  }
}

export const resourceJSONToLearningResource = (
  resourceJSON: ResourceJSON,
  uuid: string,
  url: string,
  courseJSON: CourseJSON
): LearningResource => {
  let trimmedURL = url.replace(/data.json$/, "")

  return {
    id: uuid,
    title: resourceJSON.title,
    image_src: "",
    object_type: LearningResourceType.ResourceFile,
    platform: OCW_PLATFORM,
    topics: formatCourseJSONTopics(courseJSON),
    runs: [],
    level: null,
    instructors: [],
    department: undefined,
    audience: undefined,
    certification: undefined,
    content_title: resourceJSON.title,
    run_title: null,
    run_slug: null,
    content_type: fileTypeToContentType(resourceJSON.file_type),
    url: trimmedURL,
    short_url: null,
    course_id: null,
    coursenum: null,
    description: resourceJSON.description,
    course_feature_tags: []
  }
}

export const searchResultToLearningResource = (
  result: LearningResourceResult
): LearningResource => ({
  id: result.id,
  title: result.title,
  image_src: result.image_src,
  object_type: result.object_type,
  platform: "platform" in result ? result.platform : null,
  topics: result.topics ? result.topics.map(topic => ({ name: topic })) : [],
  runs: "runs" in result ? (result.runs as CourseRun[]) : [],
  level: !emptyOrNil(result.runs) ? result.runs![0]?.level : null,
  instructors: !emptyOrNil(result.runs) ? result.runs![0]?.instructors : [],
  department: result.department,
  audience: result.audience,
  certification: result.certification,
  content_title: result.content_title,
  run_title: result.run_title || null,
  run_slug: result.run_slug || null,
  content_type: result.content_type || null,
  url: getResultUrl(result) || null,
  short_url: result.short_url || null,
  course_id: result.course_id || null,
  coursenum: result.coursenum || null,
  description: result.short_description || null,
  course_feature_tags: result.course_feature_tags
    ? result.course_feature_tags
    : []
})

const IMAGE_URL_PREFIX = process.env["RESOURCE_BASE_URL"] || ""

/**
 * Get a properly formatted cover image URL for a given LearningResource
 *
 * If the resource doesn't have an `.image_src` set on it, get a URL for
 * the corresponding generic thumbnail instead.
 */
export const getCoverImageUrl = (result: LearningResource) => {
  if (!emptyOrNil(result.image_src)) {
    let { image_src } = result
    if (!image_src.startsWith("/")) {
      return image_src
    } else {
      return `${IMAGE_URL_PREFIX.replace(/\/$/, "")}/${result.image_src.replace(
        /^\//,
        ""
      )}`
    }
  } else {
    return `/images/${result.content_type}_thumbnail.png`
  }
}

export const getCourseUrl = (result: CourseResult) => {
  if (emptyOrNil(result.runs)) {
    return null
  }
  const publishedRuns = result.runs.filter(run => run.published)
  if (!emptyOrNil(publishedRuns)) {
    const publishedRun = publishedRuns.sort((a, b) =>
      a.best_start_date < b.best_start_date ? 1 : -1
    )[0].slug
    // a temporary hack to handle runs possibly including the "courses" prefix
    return publishedRun.includes("courses/")
      ? `/${publishedRun}/`
      : `/courses/${publishedRun}/`
  } else return null
}

export const getSectionUrl = (result: LearningResourceResult) => {
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
  return `/pages/${urlPieces.join("/")}`
}

export const getResourceUrl = (result: LearningResourceResult) => {
  if (
    result.object_type === LearningResourceType.ResourceFile &&
    result.content_type === CONTENT_TYPE_PAGE
  ) {
    // parse the url to get section pieces, then construct a new section url
    const sectionUrl = getSectionUrl(result)
    const runSlug = result.run_slug
    // a temporary hack to handle runs possibly including the "courses" prefix
    return `${
      runSlug.includes("courses/") ? "/" : "/courses/"
    }${runSlug}${sectionUrl}`
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
export const getResultUrl = (result: LearningResourceResult) =>
  result.object_type === LearningResourceType.Course
    ? getCourseUrl(result)
    : getResourceUrl(result)
