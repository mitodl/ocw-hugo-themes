import {
  LearningResourceType,
  OCW_PLATFORM,
  COURSE_ARCHIVED,
  COURSE_CURRENT,
  PROFESSIONAL,
  OPEN_CONTENT,
  CERTIFICATE,
  ContentType
} from "./lib/constants"

type Audience =
  | [typeof OPEN_CONTENT]
  | [typeof PROFESSIONAL]
  | [typeof OPEN_CONTENT, typeof PROFESSIONAL]

type Certification = [] | [typeof CERTIFICATE]

export interface CourseResult {
  id: number
  course_id: string
  coursenum: string
  title: string
  url: string
  image_src: string
  short_description: string
  department: string
  platform: typeof OCW_PLATFORM
  offered_by: [typeof OCW_PLATFORM]
  topics: string[]
  object_type: LearningResourceType.Course
  runs: CourseRun[]
  audience: Audience
  certification: Certification
  course_feature_tags: string[]
  content_title: undefined
  run_title: undefined
  run_slug: undefined
  content_type: undefined
  short_url: undefined
}

interface CourseRunPrice {
  mode: string
  price: number
}

export interface CourseRun {
  run_id: string
  id: number
  url: string
  image_src: string
  short_description: string
  language: "es-US" | "fr" | null
  semester: "Fall" | "Spring" | null
  year: number
  level: "Graduate" | "Undergraduate" | null
  start_date: string
  end_date: string
  best_start_date: string
  best_end_date: string
  enrollment_start: string
  enrollment_end: string
  slug: string
  availability: typeof COURSE_ARCHIVED | typeof COURSE_CURRENT | "Upcoming"
  instructors: string[]
  prices: CourseRunPrice[]
  published: boolean
  short_url: undefined
}

export interface VideoResult {
  id: number
  video_id: string
  title: string
  url: string
  image_src: string
  short_description: string
  topics: string[]
  object_type: LearningResourceType.Video
  offered_by: [typeof OCW_PLATFORM]
  runs: any[]
  audience: Audience
  certification: Certification
  department: undefined
  content_title: undefined
  run_title: undefined
  run_slug: undefined
  coursenum: undefined
  content_type: undefined
  short_url: undefined
  course_id: undefined
  course_feature_tags: undefined
}

export interface PodcastResult {
  id: number
  podcast_id: string
  title: string
  url: string
  image_src: string
  short_description: string
  topics: string[]
  object_type: LearningResourceType.Podcast
  offered_by: [typeof OCW_PLATFORM]
  runs: any[]
  audience: Audience
  certification: Certification
  department: undefined
  content_title: undefined
  run_title: undefined
  run_slug: undefined
  coursenum: undefined
  content_type: undefined
  short_url: undefined
  course_id: undefined
  course_feature_tags: undefined
}

export interface PodcastEpisodeResult {
  id: number
  podcast_id: string
  title: string
  url: string
  image_src: string
  short_description: string
  topics: string[]
  object_type: LearningResourceType.PodcastEpisode
  offered_by: [typeof OCW_PLATFORM]
  runs: any[]
  series_title: string
  audience: Audience
  certification: Certification
  department: undefined
  content_title: undefined
  run_title: undefined
  run_slug: undefined
  coursenum: undefined
  content_type: undefined
  short_url: undefined
  course_id: undefined
  course_feature_tags: undefined
}

export interface ResourceFileResult {
  id: number
  course_id: string
  coursenum: string
  title: string
  url: string
  image_src: string
  topics: string[]
  object_type: LearningResourceType.ResourceFile
  content_title: string
  run_title: string
  run_slug: string
  content_type: ContentType
  short_url: string
  runs: undefined
  audience: undefined
  certification: undefined
  department: undefined
  short_description: string
  course_feature_tags: undefined
}

export type LearningResourceResult =
  | CourseResult
  | VideoResult
  | PodcastResult
  | PodcastEpisodeResult
  | ResourceFileResult

interface Topic {
  name: string
}

export interface LearningResource {
  id: number
  title: string
  image_src: string
  object_type: LearningResourceType
  platform: string | null
  topics: Topic[]
  runs: CourseRun[]
  level: "Graduate" | "Undergraduate" | null
  instructors: string[]
  department: string | undefined
  audience: Audience | undefined
  certification: Certification | undefined
  content_title: string | undefined
  run_title: string | null
  run_slug: string | null
  content_type: ContentType | null
  url: string | null
  short_url: string | null
  course_id: string | null
  coursenum: string | null
  description: string | null
  course_feature_tags: string[]
}
