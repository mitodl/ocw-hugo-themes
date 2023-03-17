import "video.js/dist/video-js.css"

import "offcanvas-bootstrap/dist/js/bootstrap.offcanvas.js"
import "promise-polyfill/src/polyfill.js"
import "offcanvas-bootstrap/dist/js/bootstrap.offcanvas.js"

import "./css/course-v2.scss"
import { initDivToggle } from "./js/div_toggle"
import {
  initCourseInfoExpander,
  initCourseDescriptionExpander
} from "./js/course_expander"
import { initCourseDrawersClosingViaSwiping } from "./js/mobile_course_drawers"
import {
  clearSolution,
  checkAnswer,
  showSolution
} from "./js/quiz_multiple_choice"

$(function() {
  initCourseDescriptionExpander(document)
  initCourseInfoExpander(document)
  initDivToggle()
  clearSolution()
  checkAnswer()
  showSolution()
  initCourseDrawersClosingViaSwiping()
})

// @ts-expect-error for window.initVideoJS()
window.initVideoJS = () =>
  import("./videojs-imports").then(module => {
    module.initVideoJS()
  })

// @ts-expect-error for window.initNanogallery2()
window.initNanogallery2 = () => import("./nanogallery2-imports")
