import { renderHook } from "@testing-library/react-hooks"
import {
  makeCourseJSON,
  makeFakeCourseName,
  makeFakeURL,
  makeFakeUUID,
  makeResourceJSON
} from "../factories/search"
import { resourceJSONToLearningResource } from "../lib/search"
import { getLearningResourcesFromCourseList } from "../lib/util"
import {
  CollectionItem,
  OCWWindow,
  useCourseListData,
  useResourceCollectionData
} from "./hugo_data"

declare let window: OCWWindow

const testUid = "test-uuid-1234-5678"

function courseListsSetup() {
  window.courseListsData = {
    [testUid]: [...Array(10)].map((_, index) => ({
      [`course-${index}`]: makeCourseJSON()
    }))
  }
}

test("course collection hook should return LearningResources", () => {
  courseListsSetup()
  const { result } = renderHook(() => useCourseListData(testUid))
  expect(result.current).toEqual(
    getLearningResourcesFromCourseList(window.courseListsData[testUid])
  )
})

test("course collection hook should throw if the property isn't set", () => {
  // @ts-expect-error TODO
  window.courseCollectionsData = undefined
  const { result } = renderHook(useCourseListData)
  expect(result.error).toEqual(Error("course collection data missing"))
})

function resourceCollectionSetup() {
  const collection = [...Array(10)].map(() => [
    makeFakeUUID(),
    makeFakeCourseName()
  ]) as CollectionItem[]
  window.resourceCollectionData = {
    resourceURLMap: Object.fromEntries(
      collection.map(([uuid]) => [uuid, makeFakeURL()])
    ),
    resourceJSONMap: Object.fromEntries(
      collection.map(([uuid]) => [uuid, makeResourceJSON()])
    ),
    courseJSONMap: Object.fromEntries(
      collection.map(([, courseName]) => [courseName, makeCourseJSON()])
    ),
    collection
  }
  return collection
}

test("resource collection hook should return LearningResources", () => {
  const collection = resourceCollectionSetup()
  const { result } = renderHook(useResourceCollectionData)
  expect(result.current).toEqual(
    collection.map(([uuid, courseName]) =>
      resourceJSONToLearningResource(
        window.resourceCollectionData.resourceJSONMap[uuid],
        uuid,
        window.resourceCollectionData.resourceURLMap[uuid],
        window.resourceCollectionData.courseJSONMap[courseName]
      )
    )
  )
})

test("resource collection hook should throw when window.resourceCollectionData is missing", () => {
  // @ts-expect-error TODO
  window.resourceCollectionData = undefined
  const { result } = renderHook(useResourceCollectionData)
  expect(result.error).toEqual(Error("resource collection data missing"))
})

test.each(["courseJSONMap", "resourceJSONMap", "resourceURLMap", "collection"])(
  "resource collection hook should throw when %p is undefined",
  (propName: string) => {
    resourceCollectionSetup()
    // @ts-expect-error TODO
    window.resourceCollectionData[propName] = undefined
    const { result } = renderHook(useResourceCollectionData)
    expect(result.error).toEqual(Error("resource collection data missing"))
  }
)
