import { renderHook } from "@testing-library/react-hooks"
import {
  makeCourseJSON,
  makeFakeCourseName,
  makeFakeURL,
  makeFakeUUID,
  makeResourceJSON
} from "../factories/search"
import {
  courseJSONToLearningResource,
  resourceJSONToLearningResource
} from "../lib/search"
import {
  CollectionItem,
  OCWWindow,
  useCourseCollectionData,
  useResourceCollectionData
} from "./hugo_data"

declare let window: OCWWindow

function courseCollectionSetup() {
  window.courseCollectionData = Object.fromEntries(
    [...Array(10)].map((_, index) => [`course-${index}`, makeCourseJSON()])
  )
}

test("course collection hook should return LearningResources", () => {
  courseCollectionSetup()
  const { result } = renderHook(useCourseCollectionData)
  expect(result.current).toEqual(
    Object.entries(window.courseCollectionData).map(([name, courseJSON]) =>
      courseJSONToLearningResource(name, courseJSON)
    )
  )
})

test("course collection hook should throw if the property isn't set", () => {
  // @ts-ignore
  window.courseCollectionData = undefined
  const { result } = renderHook(useCourseCollectionData)
  expect(result.error).toEqual(Error("course collection data missing"))
})

function resourceCollectionSetup() {
  let collection = [...Array(10)].map(() => [
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
  // @ts-ignore
  window.resourceCollectionData = undefined
  const { result } = renderHook(useResourceCollectionData)
  expect(result.error).toEqual(Error("resource collection data missing"))
})

test.each(["courseJSONMap", "resourceJSONMap", "resourceURLMap", "collection"])(
  "resource collection hook should throw when %p is undefined",
  (propName: string) => {
    resourceCollectionSetup()
    // @ts-ignore
    window.resourceCollectionData[propName] = undefined
    const { result } = renderHook(useResourceCollectionData)
    expect(result.error).toEqual(Error("resource collection data missing"))
  }
)
