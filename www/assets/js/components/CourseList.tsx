import { useCourseListData } from "../hooks/hugo_data"
import CourseListRow from "./CourseListRow"

interface Props {
  uid: string
}

export default function CourseList(props: Props) {
  const { uid } = props

  const data = useCourseListData(uid)

  return (
    <div className="col-12 col-lg-8 pb-2">
      {data.map((learningResource, index) => (
        <CourseListRow course={learningResource} key={index} />
      ))}
    </div>
  )
}
