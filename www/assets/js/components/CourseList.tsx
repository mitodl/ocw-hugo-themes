import { LearningResource } from "../LearningResources"
import { useCourseListData } from "../hooks/hugo_data"
import CourseListRow from "./CourseListRow"

interface Props {
  uid: string
}

export default function CourseList(props: Props): JSX.Element {
  const { uid } = props
  const courses = useCourseListData(uid)

  return (
    <div className="col-12 col-lg-8 pb-2">
      {courses.map((course: LearningResource) => (
        <CourseListRow
          key={course.id}
          course={course}
          data-testid="course-list-row"
        />
      ))}
    </div>
  )
}
