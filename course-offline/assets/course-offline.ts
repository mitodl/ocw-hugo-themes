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
import {initImageGalleriesFromMarkup} from "../../course-v2/assets/js/init_image_galleries_from_markup"
import "nanogallery2/src/jquery.nanogallery2.core.js"
import "nanogallery2/src/css/nanogallery2.css"
import "videojs-youtube"
import videojs from "video.js"

export interface OCWWindow extends Window {
  $: JQueryStatic
  jQuery: JQueryStatic
  videojs: typeof videojs
  initNanogallery2: () => void
}

declare let window: OCWWindow

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

let nanogallery2Loaded = false

window.initNanogallery2 = () => {
  if (nanogallery2Loaded) return
  initImageGalleriesFromMarkup()
  nanogallery2Loaded = true
}
