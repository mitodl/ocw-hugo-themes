import React from "react"
import { useCourseCollectionData } from "../hooks/hugo_data"
import { SEARCH_LIST_UI } from "../lib/search"
import CourseCollectionRow from "./CourseCollectionRow"
import { LearningResourceDisplay } from "./SearchResult"

interface Props {
  uid: string
}

export default function CourseCollection(props: Props) {
  const { uid } = props

  const data = useCourseCollectionData(uid)

  return (
    <div className="col-12 col-lg-8 pb-2">
      {data.map((learningResource, index) => (
        <CourseCollectionRow course={learningResource} key={index} />
      ))}
    </div>
  )
}
