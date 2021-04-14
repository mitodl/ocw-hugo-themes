export const LR_TYPE_COURSE = "course"
export const LR_TYPE_VIDEO = "video"
export const LR_TYPE_PODCAST = "podcast"
export const LR_TYPE_PODCAST_EPISODE = "podcastepisode"
export const LR_TYPE_RESOURCEFILE = "resourcefile"

export const CONTENT_TYPE_PDF = "pdf"
export const CONTENT_TYPE_PAGE = "page"
export const CONTENT_TYPE_VIDEO = LR_TYPE_VIDEO
export const CONTENT_TYPE_SEARCHABLE = [
  CONTENT_TYPE_PDF,
  CONTENT_TYPE_PAGE,
  CONTENT_TYPE_VIDEO
]

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
  [LR_TYPE_COURSE]:          "Course",
  [LR_TYPE_VIDEO]:           "Video",
  [LR_TYPE_PODCAST]:         "Podcast",
  [LR_TYPE_PODCAST_EPISODE]: "Podcast Episode",
  [LR_TYPE_RESOURCEFILE]:    "Course Resource"
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
