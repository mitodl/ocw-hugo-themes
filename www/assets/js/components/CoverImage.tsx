import { LearningResourceType } from "@mitodl/course-search-utils"
import React from "react"

import { LearningResource } from "../LearningResources"
import { CAROUSEL_IMG_HEIGHT } from "../lib/constants"
import { getCoverImageUrl } from "../lib/search"

interface Props {
  object: LearningResource
}

export default function CoverImage({ object }: Props) {
  let className
  let altText = ""

  if (object.object_type !== LearningResourceType.ResourceFile) {
    className = "cover-image"
  } else if (
    [object.object_type, object.content_type].includes(
      LearningResourceType.Video
    )
  ) {
    className = "cover-image-video"
    altText = "video"
  } else {
    className = "cover-image-resource"
    altText = object.content_type ? object.content_type : ""
  }

  return (
    <div className={className}>
      {[object.object_type, object.content_type].includes(
        LearningResourceType.Video
      ) ? (
          <a href={object.url ?? ""}>
            <img
              src={getCoverImageUrl(object)}
              height={CAROUSEL_IMG_HEIGHT}
              alt={altText}
            />
            <img
              src="/images/video_play_overlay.png"
              className="video-play-icon"
              alt=""
            />
            <img
              src="/images/mobile_video_thumbnail.png"
              className="mobile-video-icon"
              alt={altText}
            />
          </a>
        ) : (
          <a href={object.url ?? ""}>
            <img
              src={getCoverImageUrl(object)}
              height={CAROUSEL_IMG_HEIGHT}
              alt={altText}
            />
          </a>
        )}
    </div>
  )
}
