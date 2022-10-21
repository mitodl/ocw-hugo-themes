/* eslint-disable camelcase */

import { emptyOrNil } from "./util"
import {
  OCW_PLATFORM,
  CONTENT_TYPE_PAGE,
  CONTENT_TYPE_PDF,
  CONTENT_TYPE_VIDEO,
  ContentType
} from "./constants"
import { LearningResourceType } from "@mitodl/course-search-utils"
import {
  CourseResult,
  CourseRun,
  CourseJSON,
  LearningResource,
  LearningResourceResult,
  ResourceJSON
} from "../LearningResources"

const formatCourseJSONTopics = (courseJSON: CourseJSON) =>
  courseJSON.topics ?
    Array.from(new Set(courseJSON.topics.flat())).map(topic => ({
      name: topic
    })) :
    []

export const courseJSONToLearningResource = (
  name: string,
  courseData: CourseJSON
): LearningResource => ({
  id:                  courseData.site_uid || courseData.legacy_uid,
  title:               courseData.course_title,
  image_src:           courseData.image_src,
  object_type:         LearningResourceType.Course,
  platform:            OCW_PLATFORM,
  topics:              formatCourseJSONTopics(courseData),
  runs:                [],
  level:               courseData.level,
  instructors:         courseData.instructors.map(instructor => instructor.title),
  department:          courseData.department_numbers.join(" "),
  audience:            undefined,
  certification:       undefined,
  content_title:       undefined,
  run_title:           null,
  run_slug:            null,
  content_type:        null,
  // a temporary hack to handle runs possibly including the "courses" prefix
  url:                 name.includes("courses/") ? `/${name}/` : `/courses/${name}/`,
  short_url:           null,
  course_id:           courseData.site_uid || courseData.legacy_uid,
  coursenum:           courseData.primary_course_number,
  description:         courseData.course_description,
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
  const trimmedURL = url.replace(/data.json$/, "")

  return {
    id:                  uuid,
    title:               resourceJSON.title,
    image_src:           "",
    object_type:         LearningResourceType.ResourceFile,
    platform:            OCW_PLATFORM,
    topics:              formatCourseJSONTopics(courseJSON),
    runs:                [],
    level:               null,
    instructors:         [],
    department:          undefined,
    audience:            undefined,
    certification:       undefined,
    content_title:       resourceJSON.title,
    run_title:           null,
    run_slug:            null,
    content_type:        fileTypeToContentType(resourceJSON.file_type),
    url:                 trimmedURL,
    short_url:           null,
    course_id:           null,
    coursenum:           null,
    description:         resourceJSON.description,
    course_feature_tags: []
  }
}

export const searchResultToLearningResource = (
  result: LearningResourceResult
): LearningResource => ({
  id:                  result.id,
  title:               result.title,
  image_src:           result.image_src,
  object_type:         result.object_type,
  platform:            "platform" in result ? result.platform : null,
  topics:              result.topics ? result.topics.map(topic => ({ name: topic })) : [],
  runs:                "runs" in result ? (result.runs as CourseRun[]) : [],
  level:               !emptyOrNil(result.runs) ? result.runs![0]?.level : null,
  instructors:         !emptyOrNil(result.runs) ? result.runs![0]?.instructors : [],
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

const IMAGE_URL_PREFIX = process.env["RESOURCE_BASE_URL"] || ""

/**
 * Get a properly formatted cover image URL for a given LearningResource
 *
 * If the resource doesn't have an `.image_src` set on it, get a URL for
 * the corresponding generic thumbnail instead.
 */
export const getCoverImageUrl = (result: LearningResource) => {
  if (!emptyOrNil(result.image_src)) {
    const { image_src } = result
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
    return publishedRun.includes("courses/") ?
      `/${publishedRun}/` :
      `/courses/${publishedRun}/`
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
  result.object_type === LearningResourceType.Course ?
    getCourseUrl(result) :
    getResourceUrl(result)
