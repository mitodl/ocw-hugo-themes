import React from "react"
import Dotdotdot from "react-dotdotdot"
import { serializeSearchParams } from "@mitodl/course-search-utils/dist/url_utils"

import Card from "./Card"

import { SEARCH_URL } from "../lib/constants"
import { getCoverImageUrl } from "../lib/search"
import { emptyOrNil } from "../lib/util"
import { LearningResource } from "../LearningResources"
import { LearningResourceType } from "@mitodl/course-search-utils/dist/constants"
import CoverImage from "./CoverImage"

interface SubtitleProps {
  label?: string
  children: React.ReactNode
  htmlClass: string
  postLabel?: string
}

const Subtitle = ({ label, children, htmlClass, postLabel }: SubtitleProps) => (
  <div className="lr-row subtitle">
    <div className={`lr-subtitle ${htmlClass}`}>
      {label ? <div className="gray">{label}</div> : ""}
      <div className="content">
        {children}
        {postLabel ? <div className="more">{postLabel}</div> : ""}
      </div>
    </div>
  </div>
)

const makeIdTitle = (id: string) => `${id}-title`

const Topics = ({
  object,
  maxTags
}: {
  object: LearningResource
  maxTags: number
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

  if (isResource(object)) {
    return (
      <Card className="learning-resource-card list-view learning-resource-card-resource">
        <div className="lr-info search-result">
          <div className="lr-row resource-header">
            <div className="resource-type">
              <a href={`/courses/${object.run_slug}`}>
                <Dotdotdot clamp={3}>
                  {object.coursenum ? `${object.coursenum} ` : ""}
                  {object.run_title}
                </Dotdotdot>
              </a>
            </div>
          </div>
          <div className="lr-row">
            <CoverImage object={object} />
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
            </div>
          </div>
        </div>
        <div className="resource-topics-div">
          <Topics object={object} maxTags={maxTags} />
        </div>
      </Card>
    )
  } else {
    return (
      <Card className="learning-resource-card list-view">
        <div className="lr-info search-result">
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
          <Topics object={object} maxTags={maxTags} />
        </div>
        <CoverImage object={object} />
      </Card>
    )
  }
}
