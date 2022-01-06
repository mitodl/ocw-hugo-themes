import { useEffect, useState } from "react"
import { CourseJSON, LearningResource } from "../LearningResources"
import { courseJSONToLearningResource } from "../lib/search"

export interface OCWWindow extends Window {
  courseCollectionContents: {
    [key: string]: CourseJSON
  }
}

declare let window: OCWWindow

export function useCourseCollectionData(): LearningResource[] {
  const [data, setData] = useState<LearningResource[]>([])

  useEffect(() => {
    const data = window.courseCollectionContents

    if (data === undefined) {
      throw new Error("course collection data missing")
    }

    setData(
      Object.entries(
        window.courseCollectionContents
      ).map(([name, courseJSON]) =>
        courseJSONToLearningResource(name, courseJSON)
      )
    )
  }, [setData])

  return data
}
