import "video.js/dist/video-js.css"

import "offcanvas-bootstrap/dist/js/bootstrap.offcanvas.js"
import "promise-polyfill/src/polyfill.js"
import "../../course-v3/assets/css/course-v3.scss"
import { initDivToggle } from "../../course-v3/assets/js/div_toggle"
import initMITLearnHeader from "../../course-v3/assets/js/mit_learn_header"
import {
  initCourseInfoExpander,
  initCourseDescriptionExpander
} from "../../course-v3/assets/js/course_expander"
import {
  clearSolution,
  checkAnswer,
  showSolution
} from "../../course-v3/assets/js/quiz_multiple_choice"
import { initImageGalleryLightbox } from "../../base-theme/assets/js/image_gallery_lightbox"
import { initMobileCourseMenuV3 } from "../../course-v3/assets/js/mobile_course_menu_v3"
import { initTableRowspanBorders } from "../../course-v3/assets/js/table_rowspan_borders"
import "videojs-youtube"
import videojs from "video.js"

export interface OCWWindow extends Window {
  $: JQueryStatic
  jQuery: JQueryStatic
  videojs: typeof videojs
}

declare let window: OCWWindow

$(function() {
  initMITLearnHeader()
  initCourseDescriptionExpander(document)
  initCourseInfoExpander(document)
  initDivToggle()
  clearSolution()
  checkAnswer()
  showSolution()
  initMobileCourseMenuV3()
  initTableRowspanBorders()
  initImageGalleryLightbox()
  window.videojs = videojs
})
