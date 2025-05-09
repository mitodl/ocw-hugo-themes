/* eslint-disable camelcase */
import { LearningResourceType } from "@mitodl/course-search-utils"
import casual from "casual"
import { times } from "ramda"
import {
  CourseResult,
  CourseRun,
  PodcastResult,
  PodcastEpisodeResult,
  ResourceFileResult,
  VideoResult,
  LearningResourceResult,
  CourseJSON,
  ResourceJSON
} from "../LearningResources"

import {
  OCW_PLATFORM,
  DATE_FORMAT,
  COURSE_ARCHIVED,
  COURSE_CURRENT,
  OPEN_CONTENT,
  PROFESSIONAL,
  CERTIFICATE,
  CONTENT_TYPE_VIDEO,
  CONTENT_TYPE_PDF,
  CONTENT_TYPE_PAGE,
  RESOURCE_TYPE
} from "../lib/constants"

export type Factory<T> = (overrides?: Partial<T>) => T

export function* incrementer() {
  let int = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    yield int++
  }
}

export function makeFakeUUID(): string {
  return casual.uuid
}

export function makeFakeURL(): string {
  return casual.url
}

export function makeFakeCourseName(): string {
  return casual.title
}

const incrRun = incrementer()

export function makeLearningResourceResult(
  objectType: LearningResourceType.Course,
  overrides?: Partial<CourseResult>
): CourseResult
export function makeLearningResourceResult(
  objectType: LearningResourceType.Video,
  overrides?: Partial<VideoResult>
): VideoResult
export function makeLearningResourceResult(
  objectType: LearningResourceType.Podcast,
  overrides?: Partial<PodcastResult>
): PodcastResult
export function makeLearningResourceResult(
  objectType: LearningResourceType.PodcastEpisode,
  overrides?: Partial<PodcastEpisodeResult>
): PodcastEpisodeResult
export function makeLearningResourceResult(
  objectType: LearningResourceType.ResourceFile,
  overrides?: Partial<ResourceFileResult>
): ResourceFileResult
export function makeLearningResourceResult(
  objectType: LearningResourceType,
  overrides?: Partial<LearningResourceResult>
): LearningResourceResult
export function makeLearningResourceResult(
  objectType: LearningResourceType,
  overrides?: Partial<LearningResourceResult>
): LearningResourceResult {
  switch (objectType) {
  case LearningResourceType.Course:
    return makeCourseResult(overrides as Partial<CourseResult>)
  case LearningResourceType.Video:
    return makeVideoResult(overrides as Partial<VideoResult>)
  case LearningResourceType.Podcast:
    return makePodcastResult(overrides as Partial<PodcastResult>)
  case LearningResourceType.PodcastEpisode:
    return makePodcastEpisodeResult(
        overrides as Partial<PodcastEpisodeResult>
    )
  default:
    return makeResourceFileResult(overrides as Partial<ResourceFileResult>)
  }
}

export const makeRun: Factory<CourseRun> = (overrides = {}) => {
  return {
    run_id:            `courserun_${incrRun.next().value}`,
    id:                incrRun.next().value!,
    url:               casual.url,
    image_src:         "http://image.medium.url",
    short_description: casual.description,
    language:          casual.random_element(["en-US", "fr", null]),
    semester:          casual.random_element(["Fall", "Spring", null]),
    year:              casual.year,
    level:             casual.random_element([
      ["Graduate"],
      ["Undergraduate"],
      ["Graduate", "Undergraduate"],
      [],
      null
    ]),
    start_date:       casual.date(DATE_FORMAT),
    end_date:         casual.date(DATE_FORMAT),
    best_start_date:  casual.date(DATE_FORMAT),
    best_end_date:    casual.date(DATE_FORMAT),
    enrollment_start: casual.date(DATE_FORMAT),
    enrollment_end:   casual.date(DATE_FORMAT),
    slug:             casual.word,
    availability:     casual.random_element([
      COURSE_ARCHIVED,
      COURSE_CURRENT,
      "Upcoming"
    ]),
    instructors: [
      `${casual.name} ${casual.name}`,
      `${casual.name} ${casual.name}`
    ],
    prices:    [{ mode: "audit", price: casual.integer(1, 1000) }],
    published: true,
    // this is here to make typescript happy
    short_url: undefined,
    ...overrides
  }
}

export function makeDistinctiveTopics(count: number, prefix: string): string[] {
  return Array(count)
    .fill(null)
    .map((_, index) => `${prefix}-${casual.word}-${index + 1}`)
}

export const makeCourseResult: Factory<CourseResult> = (overrides = {}) => {
  // Create base object with default values
  const result = {
    id:                casual.integer(1, 1000),
    course_id:         `course+${String(casual.random)}`,
    coursenum:         String(casual.random),
    title:             casual.title,
    url:               casual.url,
    image_src:         "http://image.medium.url",
    short_description: casual.description,
    platform:          OCW_PLATFORM as "OCW",
    offered_by:        [OCW_PLATFORM] as ["OCW"],
    topics:            makeDistinctiveTopics(2, "topic"),
    object_type:       LearningResourceType.Course as LearningResourceType.Course,
    runs:              times(() => makeRun(), 3),
    audience:          casual.random_element([
      [],
      [OPEN_CONTENT],
      [PROFESSIONAL],
      [OPEN_CONTENT, PROFESSIONAL]
    ]),
    certification:       casual.random_element([[], [CERTIFICATE]]),
    course_feature_tags: [casual.word, casual.word],
    department:          casual.word,
    // this is here to make typescript happy
    content_title:       undefined,
    run_title:           undefined,
    run_slug:            undefined,
    content_type:        undefined,
    short_url:           undefined,
    level:               casual.random_element([
      ["Graduate"],
      ["Undergraduate"],
      ["Graduate", "Undergraduate"],
      [],
      null
    ])
  }

  // Apply overrides to the base object
  return { ...result, ...overrides }
}

export const makeCourseJSON: Factory<CourseJSON> = (overrides = {}) => ({
  site_uid:              casual.uuid,
  legacy_uid:            casual.uuid,
  primary_course_number: casual.word,
  extra_course_numbers:  casual.word,
  term:                  casual.word,
  course_title:          casual.title,
  course_description:    casual.description,
  image_src:             casual.url,
  topics:                [
    [casual.word],
    [casual.word, casual.word],
    [casual.word, casual.word]
  ],
  level: casual.random_element([
    ["Graduate"],
    ["Undergraduate"],
    ["Graduate", "Undergraduate"],
    [],
    null
  ]),
  instructors: [...Array(4)].map(() => {
    const first_name = casual.first_name
    const last_name = casual.last_name

    return {
      first_name,
      last_name,
      middle_initial: casual.letter.toUpperCase(),
      salutation:     "Prof.",
      title:          `Prof. ${first_name}, ${last_name}`
    }
  }),
  department_numbers:      [casual.word, casual.word],
  learning_resource_types: [casual.word, casual.word],
  year:                    String(casual.year),
  hide_download:           casual.boolean,
  course_image_metadata:   {
    file:           casual.string,
    image_metadata: {
      "image-alt": casual.short_description,
      caption:     casual.short_description
    }
  },
  ...overrides
})

export const makeResourceJSON: Factory<ResourceJSON> = (overrides = {}) => ({
  title:                   casual.title,
  description:             casual.description,
  file:                    casual.string,
  learning_resource_types: [casual.word, casual.word],
  resource_type:           RESOURCE_TYPE.Document,
  file_type:               "application/pdf",
  image_metadata:          {
    "image-alt": casual.description,
    caption:     casual.description
  },
  youtube_key:     casual.string,
  captions_file:   casual.string,
  transcript_file: casual.string,
  archive_url:     casual.string,
  ...overrides
})

export const makeResourceFileResult: Factory<ResourceFileResult> = (
  overrides = {}
) => ({
  id:            casual.integer(1, 1000),
  course_id:     `course_${String(casual.random)}`,
  coursenum:     String(casual.random),
  title:         casual.title,
  url:           casual.url,
  image_src:     "http://image.medium.url",
  topics:        [casual.word, casual.word],
  object_type:   LearningResourceType.ResourceFile,
  content_title: casual.title,
  run_title:     casual.title,
  run_slug:      `/slug_${String(casual.word)}`,
  content_type:  casual.random_element([
    CONTENT_TYPE_VIDEO,
    CONTENT_TYPE_PDF,
    CONTENT_TYPE_PAGE
  ]),
  short_url:           `/short_${String(casual.word)}`,
  short_description:   casual.short_description,
  // this is here to make typescript happy
  runs:                undefined,
  audience:            undefined,
  certification:       undefined,
  department:          undefined,
  course_feature_tags: undefined,
  ...overrides
})

export const makeVideoResult: Factory<VideoResult> = (overrides = {}) => ({
  id:                casual.integer(1, 1000),
  video_id:          `video_${String(casual.random)}`,
  title:             casual.title,
  url:               casual.url,
  image_src:         "http://image.medium.url",
  short_description: casual.description,
  topics:            [casual.word, casual.word],
  object_type:       LearningResourceType.Video,
  offered_by:        [OCW_PLATFORM],
  runs:              [],
  audience:          casual.random_element([
    [],
    [OPEN_CONTENT],
    [PROFESSIONAL],
    [OPEN_CONTENT, PROFESSIONAL]
  ]),
  certification:       casual.random_element([[], [CERTIFICATE]]),
  department:          undefined,
  content_title:       undefined,
  run_title:           undefined,
  run_slug:            undefined,
  coursenum:           undefined,
  course_id:           undefined,
  content_type:        undefined,
  course_feature_tags: undefined,
  short_url:           undefined,
  ...overrides
})

export const makePodcastResult: Factory<PodcastResult> = (overrides = {}) => ({
  id:                casual.integer(1, 1000),
  podcast_id:        `podcast_${String(casual.random)}`,
  title:             casual.title,
  url:               casual.url,
  image_src:         "http://image.medium.url",
  short_description: casual.description,
  topics:            [casual.word, casual.word],
  object_type:       LearningResourceType.Podcast,
  offered_by:        [OCW_PLATFORM],
  runs:              [],
  audience:          casual.random_element([
    [],
    [OPEN_CONTENT],
    [PROFESSIONAL],
    [OPEN_CONTENT, PROFESSIONAL]
  ]),
  certification:       casual.random_element([[], [CERTIFICATE]]),
  department:          undefined,
  content_title:       undefined,
  run_title:           undefined,
  run_slug:            undefined,
  coursenum:           undefined,
  course_id:           undefined,
  content_type:        undefined,
  course_feature_tags: undefined,
  short_url:           undefined,
  ...overrides
})

export const makePodcastEpisodeResult: Factory<PodcastEpisodeResult> = (
  overrides = {}
) => ({
  id:                casual.integer(1, 1000),
  podcast_id:        `podcastepisode_${String(casual.random)}`,
  title:             casual.title,
  url:               casual.url,
  image_src:         "http://image.medium.url",
  short_description: casual.description,
  topics:            [casual.word, casual.word],
  object_type:       LearningResourceType.PodcastEpisode,
  offered_by:        [OCW_PLATFORM],
  runs:              [],
  series_title:      `podcast_${String(casual.random)}`,
  audience:          casual.random_element([
    [],
    [OPEN_CONTENT],
    [PROFESSIONAL],
    [OPEN_CONTENT, PROFESSIONAL]
  ]),
  certification:       casual.random_element([[], [CERTIFICATE]]),
  department:          undefined,
  content_title:       undefined,
  run_title:           undefined,
  run_slug:            undefined,
  coursenum:           undefined,
  course_id:           undefined,
  content_type:        undefined,
  course_feature_tags: undefined,
  short_url:           undefined,
  ...overrides
})
