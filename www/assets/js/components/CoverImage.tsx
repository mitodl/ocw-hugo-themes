import { LearningResourceType } from "@mitodl/course-search-utils/dist/constants"
import React from "react"

import { LearningResource } from "../LearningResources"
import { CAROUSEL_IMG_HEIGHT } from "../lib/constants"
import { getCoverImageUrl } from "../lib/search"

interface Props {
  object: LearningResource
}

export default function CoverImage({ object }: Props) {
  return (
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
}
