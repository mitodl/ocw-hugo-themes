import { useEffect, useState } from "react"
import {
  CourseJSON,
  LearningResource,
  ResourceJSON
} from "../LearningResources"
import {
  courseJSONToLearningResource,
  resourceJSONToLearningResource
} from "../lib/search"

/**
 * A map from a course name to the `CourseJSON` record for that course. This value
 * is needed for dealing with both course collections and resource collections.
 */
interface CourseJSONMap {
  [name: string]: CourseJSON
}

export type CollectionItem = [string, string]

export interface OCWWindow extends Window {
  /**
   * Data needed for course collection rendering in React
   *
   * Map is from collection UUID to CourseJSONMap (a map of the course JSON
   * objects for that collection).
   */
  courseListsData: Record<string, CourseJSONMap>
  /**
   * Data needed for resource collection rendering in React.
   *
   * Set on window by the Hugo template
   *
   */
  resourceCollectionData: {
    courseJSONMap: CourseJSONMap
    /**
     * A map from resource UUID to the ResourceJSON for that resource. Used by
     * the Hugo template context in which this component will be rendered.
     */
    resourceJSONMap: {
      [uuid: string]: ResourceJSON
    }
    /**
     * A map from resource UUID to the relative URL for the `data.json` file
     * for that resource.
     */
    resourceURLMap: {
      [uuid: string]: string
    }
    /**
     * The resource collection as stored in the frontmatter for this
     * collection. It's formatted like:
     *
     * ```json
     * [
     *   ["item-uuid", "site-name"]
     * ]
     * ```
     */
    collection: CollectionItem[]
  }
}

declare let window: OCWWindow

/**
 * Hook for accessing course collection data, which is set on `window` by the
 * Hugo template in which our React components run. The hook takes care of
 * pulling out the data and converting it to a format (`LearningResource`)
 * which can then be rendered.
 *
 * Data is pulled out based on the uid property of the _course collection_.
 *
 * **Note**: this hook will throw an error if the data it expects isn't
 * present.
 */
export function useCourseListData(uid: string): LearningResource[] {
  const [data, setData] = useState<LearningResource[]>([])

  useEffect(() => {
    const data = window.courseListsData?.[uid]

    if (data === undefined) {
      throw new Error("course collection data missing")
    }

    setData(
      Object.entries(data).map(([name, courseJSON]) =>
        courseJSONToLearningResource(name, courseJSON)
      )
    )
  }, [setData])

  return data
}

/**
 * Pulls resource collection data, which is set on `window` by the Hugo
 * template in which our React UI for resource collections runs. The hook pulls
 * the data out and converts it to a format (`LearningResource`) which can then
 * be rendered.
 *
 * **Note**: this hook will throw an error if the data expects is not present.
 */
export function useResourceCollectionData(): LearningResource[] {
  let [data, setData] = useState<LearningResource[]>([])

  useEffect(() => {
    const data = window.resourceCollectionData

    if (data === undefined) {
      throw new Error("resource collection data missing")
    }

    const { courseJSONMap, resourceJSONMap, resourceURLMap, collection } = data

    if (
      [
        courseJSONMap,
        courseJSONMap,
        resourceJSONMap,
        resourceURLMap,
        collection
      ].some(object => object === undefined)
    ) {
      throw new Error("resource collection data missing")
    }

    let learningResources = collection.map(([itemUUID, courseName]) =>
      resourceJSONToLearningResource(
        resourceJSONMap[itemUUID],
        itemUUID,
        resourceURLMap[itemUUID],
        courseJSONMap[courseName]
      )
    )

    setData(learningResources)
  }, [setData])

  return data
}
