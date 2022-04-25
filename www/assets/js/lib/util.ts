import { either, isEmpty, isNil, match } from "ramda"
import { STATUS_CODES } from "./constants"

export const emptyOrNil = either(isEmpty, isNil)

export const getViewportWidth = () => window.innerWidth

export const isDoubleQuoted = (text: string) =>
  !emptyOrNil(match(/^".+"$/, text || ""))

export const slugify = (text: string) =>
  text
    .split(" ")
    .map(subString => subString.toLowerCase())
    .join("-")
    .replace(/[\W_]/g, "-")

export const parseQueryParams = () =>
  new URLSearchParams(window.location.search)

export const isApiSuccessful = (status: number) => {
  return (
    status >= STATUS_CODES.HTTP_200_OK &&
    status < STATUS_CODES.HTTP_300_MULTIPLE_CHOICES
  )
}
