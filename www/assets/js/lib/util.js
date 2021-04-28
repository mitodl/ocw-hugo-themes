import { either, isEmpty, isNil, match } from "ramda"

export const emptyOrNil = either(isEmpty, isNil)

export const getViewportWidth = () => window.innerWidth

export const isDoubleQuoted = text => !emptyOrNil(match(/^".+"$/, text || ""))
