/* eslint-disable camelcase */
import casual from "casual-browserify"
import { CourseJSON, ResourceJSON } from "../LearningResources"

import type {
  CourseResource as CourseSearchResult,
  ContentFile as ContentFileSearchResult
} from "@mitodl/course-search-utils"

import { DATE_FORMAT, RESOURCE_TYPE } from "../lib/constants"

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

export const makeCourseSearchResult = (): CourseSearchResult => ({
  id:            casual.integer(1, 1000),
  professional:  casual.boolean,
  certification: false,
  departments:   [
    {
      department_id: casual.word,
      name:          casual.word
    }
  ],
  resource_type: "course",
  description:   casual.description,
  image:         {
    id:          casual.integer(1, 1000),
    url:         casual.url,
    description: casual.description,
    alt:         casual.description
  },
  offered_by: {
    code: "ocw",
    name: "OCW"
  },
  platform: {
    code: "ocw",
    name: "OCW"
  },
  prices:         null,
  readable_id:    `course+${String(casual.random)}`,
  course_feature: [casual.word, casual.word],
  runs:           [
    {
      id:          casual.integer(1, 1000),
      instructors: [...Array(4)].map(() => {
        const first_name = casual.first_name
        const last_name = casual.last_name

        return {
          id:        casual.integer(1, 1000),
          first_name,
          last_name,
          full_name: `Prof. ${first_name}, ${last_name}`
        }
      }),
      image: {
        id:          casual.integer(1, 1000),
        url:         casual.url,
        description: casual.description,
        alt:         casual.description
      },
      published:  true,
      slug:       `courses/+${String(casual.word)}`,
      run_id:     casual.word,
      title:      casual.word,
      start_date: casual.date(DATE_FORMAT),
      end_date:   casual.date(DATE_FORMAT),
      level:      casual.random_element([
        [
          {
            code: "graduate",
            name: "Graduate"
          }
        ],
        [
          {
            code: "undergraduate",
            name: "Undergraduate"
          }
        ],
        [
          {
            code: "graduate",
            name: "Graduate"
          },
          {
            code: "undergraduate",
            name: "Undergraduate"
          }
        ],
        [],
        null
      ])
    }
  ],
  published:             true,
  title:                 casual.title,
  topics:                [{ id: casual.integer(1, 1000), name: casual.word }],
  learning_path_parents: [],
  user_list_parents:     [],
  course:                {
    course_numbers: casual.random_element([
      [
        {
          listing_type: "primary",
          department:   {
            department_id: casual.word,
            name:          casual.word
          },
          value: casual.word
        }
      ],

      [
        {
          listing_type: "primary",
          department:   {
            department_id: casual.word,
            name:          casual.word
          },
          value: casual.word
        },
        {
          listing_type: "cross-listed",
          department:   {
            department_id: casual.word,
            name:          casual.word
          },
          value: casual.word
        }
      ]
    ])
  }
})

export const makeContentFileSearchResult = (): ContentFileSearchResult => ({
  content_author:       "",
  year:                 casual.integer(2000, 2024),
  description:          casual.description,
  title:                casual.title,
  content_feature_type: [casual.word, casual.word],
  content:              casual.description,
  platform:             {
    code: "ocw",
    name: "OCW"
  },
  content_language:     "",
  run_readable_id:      `course+${String(casual.random)}`,
  content_title:        casual.title,
  resource_readable_id: `course+${String(casual.random)}`,
  uid:                  null,
  content_type:         "page",
  file_type:            null,
  id:                   casual.integer(1, 1000),
  departments:          [
    {
      department_id: casual.word,
      name:          casual.word
    }
  ],
  key:           casual.word,
  run_id:        casual.integer(1, 1000),
  run_title:     casual.title,
  course_number: `course+${String(casual.random)}`,
  topics:        [{ id: casual.integer(1, 1000), name: casual.word }],
  offered_by:    {
    code: "mitx",
    name: "MITx"
  },
  image_src:   casual.url,
  url:         casual.url,
  resource_id: casual.word,
  semester:    "",
  run_slug:    ""
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
