import React from "react"

import { LearningResource } from "../LearningResources"
import { getCoverImageUrl } from "../lib/search"
import Card from "./Card"

interface Props {
  course: LearningResource
}

export default function CourseListRow(props: Props) {
  const { course } = props

  return (
    <Card className="course-collection-row mb-1">
      <a
        href={course.url ?? ""}
        className="d-flex align-items-center text-decoration-none"
      >
        <img src={getCoverImageUrl(course)} alt="" />
        <div className="ml-3 course-title flex-grow-1">
          <h4 className="mb-0">{course.title}</h4>
          <div className="coursenum">{course.coursenum}</div>
        </div>
        <div className="level">
          {course.level ? course.level.join(", ") : ""}
        </div>
      </a>
    </Card>
  )
}
