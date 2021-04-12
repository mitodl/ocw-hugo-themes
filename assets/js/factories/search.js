import casual from "casual-browserify"
import { times } from "ramda"

import {
  LR_TYPE_COURSE,
  LR_TYPE_VIDEO,
  LR_TYPE_PODCAST,
  LR_TYPE_PODCAST_EPISODE,
  OCW_PLATFORM,
  ocwPlatform,
  DATE_FORMAT,
  COURSE_ARCHIVED,
  COURSE_CURRENT,
  OPEN_CONTENT,
  PROFESSIONAL,
  CERTIFICATE,
  LR_TYPE_RESOURCEFILE,
  CONTENT_TYPE_VIDEO,
  CONTENT_TYPE_PDF,
  CONTENT_TYPE_PAGE
} from "../lib/constants"

export function* incrementer() {
  let int = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    yield int++
  }
}

const incrRun = incrementer()

export const makeLearningResourceResult = objectType => {
  switch (objectType) {
  case LR_TYPE_COURSE:
    return makeCourseResult()
  case LR_TYPE_VIDEO:
    return makeVideoResult()
  case LR_TYPE_PODCAST:
    return makePodcastResult()
  case LR_TYPE_PODCAST_EPISODE:
    return makePodcastEpisodeResult()
  case LR_TYPE_RESOURCEFILE:
    return makeResourceFileResult()
  }
}

export const makeRun = () => {
  return {
    run_id:            `courserun_${incrRun.next().value}`,
    id:                incrRun.next().value,
    url:               casual.url,
    image_src:         "http://image.medium.url",
    short_description: casual.description,
    language:          casual.random_element(["en-US", "fr", null]),
    semester:          casual.random_element(["Fall", "Spring", null]),
    year:              casual.year,
    level:             casual.random_element(["Graduate", "Undergraduate", null]),
    start_date:        casual.date(DATE_FORMAT),
    end_date:          casual.date(DATE_FORMAT),
    best_start_date:   casual.date(DATE_FORMAT),
    best_end_date:     casual.date(DATE_FORMAT),
    enrollment_start:  casual.date(DATE_FORMAT),
    enrollment_end:    casual.date(DATE_FORMAT),
    slug:              casual.word,
    availability:      casual.random_element([
      COURSE_ARCHIVED,
      COURSE_CURRENT,
      "Upcoming"
    ]),
    instructors: [
      `${casual.name} ${casual.name}`,
      `${casual.name} ${casual.name}`
    ],
    prices:    [{ mode: "audit", price: casual.integer(1, 1000) }],
    published: true
  }
}

export const makeCourseResult = () => ({
  id:                casual.integer(1, 1000),
  course_id:         `course+${String(casual.random)}`,
  coursenum:         String(casual.random),
  title:             casual.title,
  url:               casual.url,
  image_src:         "http://image.medium.url",
  short_description: casual.description,
  platform:          ocwPlatform,
  offered_by:        [OCW_PLATFORM],
  topics:            [casual.word, casual.word],
  object_type:       LR_TYPE_COURSE,
  runs:              times(makeRun, 3),
  audience:          casual.random_element([
    [],
    [OPEN_CONTENT],
    [PROFESSIONAL],
    [OPEN_CONTENT, PROFESSIONAL]
  ]),
  certification:       casual.random_element([[], [CERTIFICATE]]),
  course_feature_tags: [casual.word, casual.word]
})

export const makeResourceFileResult = () => ({
  id:            casual.integer(1, 1000),
  course_id:     `course_${String(casual.random)}`,
  coursenum:     String(casual.random),
  title:         casual.title,
  url:           casual.url,
  image_src:     "http://image.medium.url",
  topics:        [casual.word, casual.word],
  object_type:   LR_TYPE_RESOURCEFILE,
  content_title: casual.title,
  run_title:     casual.title,
  run_slug:      `/slug_${String(casual.word)}`,
  content_type:  casual.random_element([
    CONTENT_TYPE_VIDEO,
    CONTENT_TYPE_PDF,
    CONTENT_TYPE_PAGE
  ]),
  short_url: `/short_${String(casual.word)}`
})

export const makeVideoResult = () => ({
  id:                casual.integer(1, 1000),
  video_id:          `video_${String(casual.random)}`,
  title:             casual.title,
  url:               casual.url,
  image_src:         "http://image.medium.url",
  short_description: casual.description,
  topics:            [casual.word, casual.word],
  object_type:       LR_TYPE_VIDEO,
  offered_by:        [OCW_PLATFORM],
  runs:              [],
  audience:          casual.random_element([
    [],
    [OPEN_CONTENT],
    [PROFESSIONAL],
    [OPEN_CONTENT, PROFESSIONAL]
  ]),
  certification: casual.random_element([[], [CERTIFICATE]])
})

export const makePodcastResult = () => ({
  id:                casual.integer(1, 1000),
  podcast_id:        `podcast_${String(casual.random)}`,
  title:             casual.title,
  url:               casual.url,
  image_src:         "http://image.medium.url",
  short_description: casual.description,
  topics:            [casual.word, casual.word],
  object_type:       LR_TYPE_PODCAST,
  offered_by:        [OCW_PLATFORM],
  runs:              [],
  audience:          casual.random_element([
    [],
    [OPEN_CONTENT],
    [PROFESSIONAL],
    [OPEN_CONTENT, PROFESSIONAL]
  ]),
  certification: casual.random_element([[], [CERTIFICATE]])
})

export const makePodcastEpisodeResult = () => ({
  id:                casual.integer(1, 1000),
  podcast_id:        `podcastepisode_${String(casual.random)}`,
  title:             casual.title,
  url:               casual.url,
  image_src:         "http://image.medium.url",
  short_description: casual.description,
  topics:            [casual.word, casual.word],
  object_type:       LR_TYPE_PODCAST_EPISODE,
  offered_by:        [OCW_PLATFORM],
  runs:              [],
  series_title:      `podcast_${String(casual.random)}`,
  audience:          casual.random_element([
    [],
    [OPEN_CONTENT],
    [PROFESSIONAL],
    [OPEN_CONTENT, PROFESSIONAL]
  ]),
  certification: casual.random_element([[], [CERTIFICATE]])
})
