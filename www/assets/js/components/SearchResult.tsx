import React from "react"
import Dotdotdot from "react-dotdotdot"
import {
  serializeSearchParams,
  LearningResourceType
} from "@mitodl/course-search-utils"

import Card from "./Card"

import { SEARCH_URL } from "../lib/constants"
import { emptyOrNil } from "../lib/util"
import { LearningResource } from "../LearningResources"
import CoverImage from "./CoverImage"

interface SubtitleProps {
  label?: string
  children: React.ReactNode
  htmlClass: string
  postLabel?: string
  moreUrl?: string | null
}

const Subtitle = ({
  label,
  children,
  htmlClass,
  postLabel,
  moreUrl
}: SubtitleProps) => (
  <div className="lr-row subtitle">
    <div className={`lr-subtitle ${htmlClass}`}>
      {label ? <div className="gray">{label}</div> : ""}
      <div className="content">
        {children}
        {postLabel && moreUrl ? (
          <a className="more" href={moreUrl}>
            {postLabel}
          </a>
        ) : (
          ""
        )}
      </div>
    </div>
  </div>
)

const makeIdTitle = (id: string) => `${id}-title`

const Topics = ({
  object,
  maxTags,
  moreUrl
}: {
  object: LearningResource
  maxTags: number
  moreUrl?: string | null
}) => {
  if (!emptyOrNil(object.topics)) {
    return (
      <div className="lr-row subtitles">
        <Subtitle
          htmlClass="listitem topics-list"
          postLabel={
            maxTags < object.topics.length
              ? `+ ${object.topics.length - maxTags} more`
              : ""
          }
          moreUrl={moreUrl}
        >
          {object.topics.slice(0, maxTags).map((topic, idx) => (
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
    )
  } else {
    return null
  }
}

interface SRProps {
  object: LearningResource
  id: string
  index: number
}

export default function SearchResult(props: SRProps) {
  const { object, id, index } = props

  return object.url ? (
    <article
      aria-labelledby={makeIdTitle(id)}
      aria-setsize={-1}
      aria-posinset={index + 1}
      tabIndex={0}
    >
      <LearningResourceDisplay {...props} />
    </article>
  ) : null
}

function isResource(object: LearningResource): boolean {
  return object.object_type === LearningResourceType.ResourceFile
}

export function LearningResourceDisplay(props: SRProps) {
  const { object, id } = props
  const maxTags = 3
  const runSlug = object.run_slug
  const url = runSlug
    ? `${runSlug.includes("courses/") ? "/" : "/courses/"}${runSlug}`
    : ""

  if (isResource(object)) {
    return (
      <Card className="learning-resource-card list-view learning-resource-card-resource">
        <div
          className={
            [object.object_type, object.content_type].includes(
              LearningResourceType.Video
            )
              ? "lr-info search-result has-min-height"
              : "lr-info search-result"
          }
        >
          <div className="lr-row resource-header">
            <div className="resource-type">
              <a href={url}>
                <Dotdotdot clamp={3}>
                  {`${object.coursenum} | ${object.run_title}`}
                </Dotdotdot>
              </a>
            </div>
          </div>
          <div className="lr-row">
            <div className="title-subtitle">
              <div className="course-title">
                {object.url ? (
                  <a href={object.url} className="w-100">
                    <Dotdotdot clamp={3}>
                      <span id={makeIdTitle(id)}>{object.content_title}</span>
                    </Dotdotdot>
                  </a>
                ) : (
                  <Dotdotdot clamp={3}>{object.title}</Dotdotdot>
                )}
              </div>
              <div className="subtitles">
                <Dotdotdot clamp={3}>{object.description}</Dotdotdot>
              </div>
              <Topics object={object} maxTags={maxTags} moreUrl={url} />
            </div>
          </div>
        </div>
        <CoverImage object={object} />
      </Card>
    )
  } else {
    return (
      <Card className="learning-resource-card list-view">
        <div className="lr-info search-result has-min-height">
          <div className="lr-row resource-header">
            <div className="resource-type">
              {`${object.coursenum}${object.level ? " | " : ""}${object.level}`}
            </div>
          </div>
          <div className="lr-row course-title">
            {object.url ? (
              <a href={object.url} className="w-100">
                <Dotdotdot clamp={3}>
                  <span id={makeIdTitle(id)}>{object.title}</span>
                </Dotdotdot>
              </a>
            ) : (
              <Dotdotdot clamp={3}>{object.title}</Dotdotdot>
            )}
          </div>
          {!emptyOrNil(object.instructors) ? (
            <div className="lr-row subtitles">
              <Subtitle
                htmlClass="listitem"
                postLabel={
                  maxTags < object.instructors.length
                    ? `+ ${object.instructors.length - maxTags} more`
                    : ""
                }
                moreUrl={object.url}
              >
                {object.instructors.slice(0, maxTags).map((instructor, i) => (
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
          <Topics object={object} maxTags={maxTags} moreUrl={object.url} />
        </div>
        <CoverImage object={object} />
      </Card>
    )
  }
}
