import "offcanvas-bootstrap/dist/js/bootstrap.offcanvas.js"
import "promise-polyfill/src/polyfill.js"
import "./css/course-v2.scss"
import { initDivToggle } from "./js/div_toggle"
import {
  initCourseInfoExpander,
  initCourseDescriptionExpander
} from "./js/course_expander"
import { initCourseDrawersClosingViaSwiping } from "./js/mobile_course_drawers"
import { initImageGalleryLightbox } from "../../base-theme/assets/js/image_gallery_lightbox"
import {
  clearSolution,
  checkAnswer,
  showSolution
} from "./js/quiz_multiple_choice"
import posthog from "posthog-js"
import { initPostHog } from "../../base-theme/assets/js/posthog"

export interface OCWWindow extends Window {
  setReadableResourceId: (value: string) => void
  posthog: typeof posthog
}

declare let window: OCWWindow

// Not in the ready callback below: the lightbox only registers a delegated
// listener on document, so it can attach as soon as this deferred bundle runs.
// Waiting for DOMContentLoaded left a window in which a thumbnail click fell
// through to the image URL instead of opening the lightbox.
initImageGalleryLightbox()

$(function() {
  window.posthog = initPostHog()
  initCourseDescriptionExpander(document)
  initCourseInfoExpander(document)
  initDivToggle()
  clearSolution()
  checkAnswer()
  showSolution()
  initCourseDrawersClosingViaSwiping()
})
