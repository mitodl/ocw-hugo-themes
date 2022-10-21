/* eslint-disable camelcase */
import { LearningResourceType } from "@mitodl/course-search-utils"
import casual from "casual-browserify"
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
  objectType: LearningResourceType.Course
): CourseResult
export function makeLearningResourceResult(
  objectType: LearningResourceType.Video
): VideoResult
export function makeLearningResourceResult(
  objectType: LearningResourceType.Podcast
): PodcastResult
export function makeLearningResourceResult(
  objectType: LearningResourceType.PodcastEpisode
): PodcastEpisodeResult
export function makeLearningResourceResult(
  objectType: LearningResourceType.ResourceFile
): ResourceFileResult
export function makeLearningResourceResult(
  objectType: LearningResourceType
): LearningResourceResult
export function makeLearningResourceResult(
  objectType: LearningResourceType
): LearningResourceResult {
  switch (objectType) {
  case LearningResourceType.Course:
    return makeCourseResult()
  case LearningResourceType.Video:
    return makeVideoResult()
  case LearningResourceType.Podcast:
    return makePodcastResult()
  case LearningResourceType.PodcastEpisode:
    return makePodcastEpisodeResult()
  default:
    return makeResourceFileResult()
  }
}

export const makeRun = (): CourseRun => {
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
    short_url: undefined
  }
}

export const makeCourseResult = (): CourseResult => ({
  id:                casual.integer(1, 1000),
  course_id:         `course+${String(casual.random)}`,
  coursenum:         String(casual.random),
  title:             casual.title,
  url:               casual.url,
  image_src:         "http://image.medium.url",
  short_description: casual.description,
  platform:          OCW_PLATFORM,
  offered_by:        [OCW_PLATFORM],
  topics:            [casual.word, casual.word],
  object_type:       LearningResourceType.Course,
  runs:              times(makeRun, 3),
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
  short_url:           undefined
})

export const makeCourseJSON = (): CourseJSON => ({
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
  course_image_metadata:   {
    file:           casual.string,
    image_metadata: {
      "image-alt": casual.short_description,
      caption:     casual.short_description
    }
  }
})

export const makeResourceJSON = (): ResourceJSON => ({
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
  archive_url:     casual.string
})

export const makeResourceFileResult = (): ResourceFileResult => ({
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
  course_feature_tags: undefined
})

export const makeVideoResult = (): VideoResult => ({
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
  // typescript!
  department:          undefined,
  content_title:       undefined,
  run_title:           undefined,
  run_slug:            undefined,
  coursenum:           undefined,
  course_id:           undefined,
  content_type:        undefined,
  course_feature_tags: undefined,
  short_url:           undefined
})

export const makePodcastResult = (): PodcastResult => ({
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
  short_url:           undefined
})

export const makePodcastEpisodeResult = (): PodcastEpisodeResult => ({
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
  short_url:           undefined
})
