/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable camelcase */
import { Facets } from "@mitodl/course-search-utils"
import {
  COURSE_ARCHIVED,
  COURSE_CURRENT,
  PROFESSIONAL,
  OPEN_CONTENT,
  CERTIFICATE,
  ContentType,
  RESOURCE_TYPE
} from "./lib/constants"

type Audience =
  | [typeof OPEN_CONTENT]
  | [typeof PROFESSIONAL]
  | [typeof OPEN_CONTENT, typeof PROFESSIONAL]

type Certification = [] | [typeof CERTIFICATE]

interface Instructor {
  first_name: string
  last_name: string
  middle_initial: string
  salutation: string
  title: string
}
interface ImageMetadata {
  "image-alt": string
  caption: string
  credit?: string
}

interface CourseImageMetadata {
  file: string
  image_metadata: ImageMetadata
}

/**
 * This is the shape of the JSON in the `data.json` files created for each
 * course.
 *
 * See the template at course/layouts/index.coursedata.json
 */
export interface CourseJSON {
  course_title: string
  course_description: string
  site_uid: string
  legacy_uid: string
  instructors: Instructor[]
  department_numbers: string[]
  learning_resource_types: string[]
  topics: string[][]
  primary_course_number: string
  extra_course_numbers: string
  term: string
  year: string
  level: Level[] | null
  image_src: string
  course_image_metadata: CourseImageMetadata
}

/**
 * A map from a course name to the `CourseJSON` record for that course. This value
 * is needed for dealing with both course collections and resource collections.
 */
export interface CourseJSONMap {
  [name: string]: CourseJSON
}

/**
 * Interface describing the shape of the ResourceJSON files generated
 * by the course theme for resource content items.
 *
 * See the template at course/layouts/resources/single.coursedata.json
 */
export interface ResourceJSON {
  title: string
  description: string
  file: string
  learning_resource_types: string[]
  resource_type: RESOURCE_TYPE
  file_type: string
  image_metadata?: ImageMetadata
  youtube_key?: string
  captions_file?: string
  transcript_file?: string
  archive_url?: string
}

interface CourseRunPrice {
  mode: string
  price: number
}

export type Level = "Graduate" | "Undergraduate" | "Non Credit"

export interface CourseRun {
  run_id: string
  id: number
  url: string
  image_src: string
  short_description: string
  language: "es-US" | "fr" | null
  semester: "Fall" | "Spring" | null
  year: number
  level: Level[] | null
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

interface Topic {
  name: string
}

export interface LearningResource {
  id?: number | string
  title: string | null
  image_src: string
  object_type?: string
  platform?: string | null
  topics: Topic[]
  runs?: CourseRun[]
  level?: Level[] | null
  instructors: string[]
  department?: string | undefined
  audience?: Audience | undefined
  certification?: Certification | undefined
  content_title?: string | undefined | null
  run_title?: string | null
  run_slug?: string | null
  content_type?: ContentType | null
  url?: string | null
  short_url?: string | null
  course_id?: string | null
  coursenum?: string | null
  description?: string | null
  course_feature_tags?: string[]
}

export type FacetKey = keyof Facets

export type FacetManifest = [FacetKey, string, boolean, boolean][]
