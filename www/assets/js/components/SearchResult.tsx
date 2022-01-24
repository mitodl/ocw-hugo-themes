import React from "react"
import Dotdotdot from "react-dotdotdot"
import { serializeSearchParams } from "@mitodl/course-search-utils/dist/url_utils"

import Card from "./Card"

import { CAROUSEL_IMG_HEIGHT, SEARCH_URL } from "../lib/constants"
import {
  getContentIcon,
  getCoverImageUrl,
  SearchLayout,
  SEARCH_GRID_UI,
  SEARCH_LIST_UI
} from "../lib/search"
import { emptyOrNil } from "../lib/util"
import { LearningResource } from "../LearningResources"
import { LearningResourceType } from "@mitodl/course-search-utils/dist/constants"

const getClassName = (searchResultLayout: SearchLayout | undefined) =>
  `learning-resource-card ${
    searchResultLayout === SEARCH_LIST_UI ? "list-view" : ""
  }`.trim()

interface SubtitleProps {
  label: string
  children: React.ReactNode
  htmlClass: string
}

const Subtitle = ({ label, children, htmlClass }: SubtitleProps) => (
  <div className="lr-row subtitle">
    <div className={`lr-subtitle ${htmlClass}`}>
      <div className="gray">{label}</div>
      <div className="content">{children}</div>
    </div>
  </div>
)

const CoverImage = ({ object }: { object: LearningResource }) => (
  <div className="cover-image">
    <a href={object.url ?? ""}>
      <img
        src={getCoverImageUrl(object)}
        height={CAROUSEL_IMG_HEIGHT}
        alt={`cover image for ${object.title}`}
      />
      {[object.object_type, object.content_type].includes(
        LearningResourceType.Video
      ) ? (
        <img
          src="/images/video_play_overlay.png"
          className="video-play-icon"
          alt="Play video icon"
        />
      ) : null}
    </a>
  </div>
)

const makeIdTitle = (id: string) => `${id}-title`

interface SRProps {
  searchResultLayout?: SearchLayout
  object: LearningResource
  id: string
  index: number
}

export default function SearchResult(props: SRProps) {
  const { searchResultLayout, object, id, index } = props

  return object.url ? (
    <article
      aria-labelledby={makeIdTitle(id)}
      aria-setsize={-1}
      aria-posinset={index + 1}
      tabIndex={0}
    >
      <Card className={getClassName(searchResultLayout)}>
        <LearningResourceDisplay {...props} />
      </Card>
    </article>
  ) : null
}

function isResource(object: LearningResource): boolean {
  return object.object_type === LearningResourceType.ResourceFile
}

export function LearningResourceDisplay(props: SRProps) {
  const { object, searchResultLayout, id } = props

  return (
    <React.Fragment>
      {searchResultLayout === SEARCH_GRID_UI ? (
        <CoverImage object={object} />
      ) : null}
      <div className="lr-info search-result">
        <div className="lr-row resource-type-audience-certificates">
          {!isResource(object) ? (
            <div className="resource-type">
              {`${object.coursenum}${object.level ? " | " : ""}${object.level}`}
            </div>
          ) : null}
        </div>
        <div className="lr-row course-title">
          {isResource(object) && object.content_type ? (
            <i className="material-icons md-24 align-bottom pr-2">
              {getContentIcon(object.content_type)}
            </i>
          ) : null}
          {object.url ? (
            <a href={object.url} className="w-100">
              <Dotdotdot clamp={3}>
                <span id={makeIdTitle(id)}>
                  {isResource(object) ? object.content_title : object.title}
                </span>
              </Dotdotdot>
            </a>
          ) : (
            <Dotdotdot clamp={3}>{object.title}</Dotdotdot>
          )}
        </div>
        {object.run_title ? (
          <div className="lr-row subtitles lr-subheader">
            <a href={`/courses/${object.run_slug}`}>
              <Dotdotdot clamp={3}>
                {object.coursenum ? `${object.coursenum} ` : ""}
                {object.run_title}
              </Dotdotdot>
            </a>
          </div>
        ) : null}
        {!emptyOrNil(object.instructors) ? (
          <div className="lr-row subtitles">
            <Subtitle
              label={`${
                object.instructors.length === 1 ? "Instructor" : "Instructors"
              }: `}
              htmlClass="listitem"
            >
              {object.instructors.map((instructor, i) => (
                <a
                  key={i}
                  href={`${SEARCH_URL}?${serializeSearchParams({
                    text: `"${instructor}"`
                  })}`}
                >
                  {instructor}{" "}
                </a>
              ))}
            </Subtitle>
          </div>
        ) : null}
        {!emptyOrNil(object.topics) ? (
          <div className="lr-row subtitles">
            <Subtitle
              label={`${object.topics.length === 1 ? "Topic" : "Topics"}: `}
              htmlClass="listitem"
            >
              {object.topics.map((topic, idx) => (
                <a
                  className="topic-link"
                  key={idx}
                  href={`${SEARCH_URL}?${serializeSearchParams({
                    text: undefined,
                    activeFacets: {
                      topics: [topic.name]
                    }
                  })}`}
                >
                  {topic.name}
                  {idx < object.topics.length - 1 ? " " : ""}
                </a>
              ))}
            </Subtitle>
          </div>
        ) : null}
        {isResource(object) ? (
          <div className="lr-row subtitles">
            <Dotdotdot clamp={3}>{object.description}</Dotdotdot>
          </div>
        ) : null}
      </div>
      {searchResultLayout === SEARCH_GRID_UI ? null : (
        <CoverImage object={object} />
      )}
    </React.Fragment>
  )
}
