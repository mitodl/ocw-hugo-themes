import "video.js/dist/video-js.css"

import "offcanvas-bootstrap/dist/js/bootstrap.offcanvas.js"
import "promise-polyfill/src/polyfill.js"
import "../../course-v2/assets/css/course-v2.scss"
import { initDivToggle } from "../../course-v2/assets/js/div_toggle"
import {
  initCourseInfoExpander,
  initCourseDescriptionExpander
} from "../../course-v2/assets/js/course_expander"
import { initCourseDrawersClosingViaSwiping } from "../../course-v2/assets/js/mobile_course_drawers"
import {
  clearSolution,
  checkAnswer,
  showSolution
} from "../../course-v2/assets/js/quiz_multiple_choice"
import { initImageGalleryLightbox } from "../../base-theme/assets/js/image_gallery_lightbox"
import "videojs-youtube"
import videojs from "video.js"

export interface OCWWindow extends Window {
  $: JQueryStatic
  jQuery: JQueryStatic
  videojs: typeof videojs
}

declare let window: OCWWindow

// Not in the ready callback below: the lightbox only registers a delegated
// listener on document, so it can attach as soon as this deferred bundle runs.
// Waiting for DOMContentLoaded left a window in which a thumbnail click fell
// through to the image URL instead of opening the lightbox.
initImageGalleryLightbox()

$(function() {
  initCourseDescriptionExpander(document)
  initCourseInfoExpander(document)
  initDivToggle()
  clearSolution()
  checkAnswer()
  showSolution()
  initCourseDrawersClosingViaSwiping()
  window.videojs = videojs
})
