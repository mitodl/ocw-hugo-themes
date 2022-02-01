import { LearningResourceType } from "@mitodl/course-search-utils/dist/constants"

export const CONTENT_TYPE_PDF = "pdf"
export const CONTENT_TYPE_PAGE = "page"
export const CONTENT_TYPE_VIDEO = LearningResourceType.Video
export const CONTENT_TYPE_SEARCHABLE = [
  CONTENT_TYPE_PDF,
  CONTENT_TYPE_PAGE,
  CONTENT_TYPE_VIDEO
]

export type ContentType =
  | typeof CONTENT_TYPE_PDF
  | typeof CONTENT_TYPE_PAGE
  | typeof CONTENT_TYPE_VIDEO

export const OCW_PLATFORM = "OCW"

export const OPEN_CONTENT = "Open Content"
export const PROFESSIONAL = "Professional Offerings"
export const CERTIFICATE = "Certificates"

export const CAROUSEL_IMG_HEIGHT = 130
export const CAROUSEL_IMG_WIDTH = 306

export const COURSE_CURRENT = "Current"
export const COURSE_AVAILABLE_NOW = "Available Now"
export const COURSE_ARCHIVED = "Archived"
export const COURSE_PRIOR = "Prior"

export const DATE_FORMAT = "YYYY-MM-DD[T]HH:mm:ss[Z]"

const ocwPlatform = "ocw"

export const platforms = {
  OCW: ocwPlatform
}

export const readableLearningResources = {
  [LearningResourceType.Course]:         "Course",
  [LearningResourceType.Video]:          "Video",
  [LearningResourceType.Podcast]:        "Podcast",
  [LearningResourceType.PodcastEpisode]: "Podcast Episode",
  [LearningResourceType.ResourceFile]:   "Course Resource"
}

export enum RESOURCE_TYPE {
  Image = "Image",
  Video = "Video",
  Other = "Other",
  Document = "Document"
}

export const DISPLAY_DATE_FORMAT = "MMMM D, YYYY"

export const SEARCH_URL = "/search/"

export const PHONE = "PHONE"
export const TABLET = "TABLET"
export const DESKTOP = "DESKTOP"

// Based on material-mobile breakpoint
export const PHONE_WIDTH = 599
// Based on desktop-wide breakpoint
export const TABLET_WIDTH = 999

export const COURSENUM_SORT_FIELD = "department_course_numbers.sort_coursenum"
