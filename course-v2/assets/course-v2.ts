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

export interface OCWWindow extends Window {
  initVideoJS: () => void
  initNanogallery2: () => void
  videoJSLoaded: boolean
  nanogallery2Loaded: boolean
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
})

window.videoJSLoaded = false
window.nanogallery2Loaded = false

window.initVideoJS = () => {
  initVideoDownloadPopup()
  import("./videojs-imports").then(module => {
    module.initVideoJS()
  })
}

window.initNanogallery2 = () => import("./nanogallery2-imports")
