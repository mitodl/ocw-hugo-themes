import "video.js/dist/video-js.css"
import "offcanvas-bootstrap/dist/js/bootstrap.offcanvas.js"
import "promise-polyfill/src/polyfill.js"
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
import { initVideoDownloadPopup } from "./js/video_download_popup"
import _ from "lodash"

$(function() {
  initCourseDescriptionExpander(document)
  initCourseInfoExpander(document)
  initDivToggle()
  clearSolution()
  checkAnswer()
  showSolution()
  initCourseDrawersClosingViaSwiping()
})

const initVideoJS = _.once(() => {
  initVideoDownloadPopup()
  import("./videojs-imports").then(module => {
    module.initVideoJS()
  })
})

const initNanogallery2 = _.once(() => {
  import("./nanogallery2-imports")
})
// @ts-expect-error for window.initVideoJS()
window.initVideoJS = () => {
  initVideoJS()
}

// @ts-expect-error for window.initNanogallery2()
window.initNanogallery2 = () => initNanogallery2()
