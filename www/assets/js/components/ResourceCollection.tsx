import React from "react"
import { useResourceCollectionData } from "../hooks/hugo_data"
import { SEARCH_LIST_UI } from "../lib/search"
import { LearningResourceDisplay } from "./SearchResult"

export default function ResourceCollection() {
  const data = useResourceCollectionData()

  return (
    <div className="col-12 col-lg-8 pb-2">
      {data.map((learningResource, index) => (
        <LearningResourceDisplay
          key={index}
          id={String(learningResource.id)}
          object={learningResource}
          searchResultLayout={SEARCH_LIST_UI}
          index={index}
        />
      ))}
    </div>
  )
}
