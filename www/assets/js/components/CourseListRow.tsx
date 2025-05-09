import React from "react"

import Card from "./Card"
import { LearningResource } from "../LearningResources"

interface Props extends React.HTMLProps<HTMLDivElement> {
  course: LearningResource
}

export default function CourseListRow(props: Props): JSX.Element {
  const { course, ...others } = props
  const levelText = course.level ? course.level.join(", ") : ""

  return (
    <Card className="course-collection-row mb-1" {...others}>
      <a
        href={course.url ?? ""}
        className="d-flex align-items-center text-decoration-none"
      >
        <img src={course.image_src} alt="" data-testid="courselistrow-image" />
        <div className="ml-3 course-title flex-grow-1">
          <h4 className="mb-0">{course.title}</h4>
          <div className="coursenum">{course.coursenum}</div>
        </div>
        <div className="level">{levelText}</div>
      </a>
    </Card>
  )
}
