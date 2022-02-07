import { either, isEmpty, isNil, match } from "ramda"

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

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

export const randomLetter =  () => {
  let idx = Math.floor(Math.random() * LETTERS.length)
  return LETTERS[idx]
}


export const randomID = () => {
  let id = ""
  for (let i = 0; i < 16; i++) {
    id += randomLetter()
  }
  return id
}
