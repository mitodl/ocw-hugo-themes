/* eslint-disable camelcase */

import { emptyOrNil } from "./util"
import {
  OCW_OFFEROR,
  CONTENT_TYPE_PAGE,
  CONTENT_TYPE_PDF,
  CONTENT_TYPE_VIDEO,
  ContentType
} from "./constants"
import { LearningResourceType } from "@mitodl/course-search-utils"
import type {
  CourseJSON,
  LearningResource,
  ResourceJSON,
  Level
} from "../LearningResources"
import type {
  CourseResource as CourseSearchResult,
  ContentFile as ContentFileSearchResult,
  LearningResourceTopic,
  CourseNumber,
  LearningResourceRun
} from "@mitodl/course-search-utils"

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
  platform:            OCW_OFFEROR,
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
    platform:            OCW_OFFEROR,
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

export const courseSearchResultToLearningResource = (
  result: CourseSearchResult
): LearningResource => ({
  id:          result.id,
  title:       result.title,
  image_src:   result.image ? result.image.url : "",
  object_type: result.resource_type,
  platform:    result.platform ? result.platform.name : null,
  topics:      result.topics ?
    result.topics.map((topic: LearningResourceTopic) => ({
      name: topic.name as string
    })) :
    [],
  level: !emptyOrNil(result.runs) ?
    (result.runs![0]?.level || []).map(level => level.name as Level) :
    [],
  instructors: !emptyOrNil(result.runs) ?
    (result.runs![0]?.instructors || []).flatMap(instructor =>
      instructor.full_name ? instructor.full_name : []
    ) :
    [],
  url:       getCourseUrl(result) || null,
  course_id: result.readable_id || null,
  coursenum:
    result.course && result.course.course_numbers ?
      result.course.course_numbers.find(
        (course_number: CourseNumber) =>
          course_number.listing_type === "primary"
      )?.value :
      null,
  description:         result.description || null,
  course_feature_tags: result.course_feature ? result.course_feature : []
})

export const resourceSearchResultToLearningResource = (
  result: ContentFileSearchResult
): LearningResource => ({
  id:          result.id,
  title:       result.title ? result.title : null,
  image_src:   result.image_src || "",
  object_type: LearningResourceType.ResourceFile,
  topics:      result.topics ?
    result.topics.map(topic => ({ name: topic.name })) :
    [],
  content_title:       result.content_title,
  run_title:           result.run_title,
  content_type:        fileTypeToContentType(result.file_type || ""),
  url:                 getResourceUrl(result) || null,
  coursenum:           result.course_number ? result.course_number[0] : null,
  description:         result.description || null,
  course_feature_tags: result.content_feature_type ?
    result.content_feature_type :
    [],
  instructors: []
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

export const getCourseUrl = (result: CourseSearchResult) => {
  if (emptyOrNil(result.runs)) {
    return null
  }
  const publishedRuns = (result.runs || []).filter(
    (run: LearningResourceRun) => run.published
  )
  if (!emptyOrNil(publishedRuns)) {
    const publishedRun = publishedRuns[0].slug
    if (!publishedRun) {
      return null
    }
    // a temporary hack to handle runs possibly including the "courses" prefix
    return publishedRun.includes("courses/") ?
      `/${publishedRun}/` :
      `/courses/${publishedRun}/`
  } else return null
}

export const getSectionUrl = (result: ContentFileSearchResult) => {
  let url = result.url
  if (!url) {
    return null
  }
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

export const getResourceUrl = (result: ContentFileSearchResult) => {
  if (fileTypeToContentType(result.file_type || "") === CONTENT_TYPE_PAGE) {
    // parse the url to get section pieces, then construct a new section url
    const sectionUrl = getSectionUrl(result)
    const runSlug = result.run_slug || ""
    // a temporary hack to handle runs possibly including the "courses" prefix
    return `${
      runSlug.includes("courses/") ? "/" : "/courses/"
    }${runSlug}${sectionUrl}`
  } else {
    // Non-page results should have full URLs, convert to CDN if it's an S3 URL
    try {
      const originalUrl = new URL(result.url || "")
      const cdnPrefix = process.env["CDN_PREFIX"]
      const useCDN =
        originalUrl.hostname.match(/s3\.amazonaws\.com/) && cdnPrefix
      return useCDN ? `${cdnPrefix}${originalUrl.pathname}` : result.url
    } catch {
      return result.url
    }
  }
}
