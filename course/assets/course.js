import "../../node_modules/nanogallery2/src/css/nanogallery2.css"

import "offcanvas-bootstrap/dist/js/bootstrap.offcanvas.js"
import "nanogallery2/src/jquery.nanogallery2.core.js"

import "./css/course.scss"
import videojs from "video.js"
import "videojs-youtube"

import { initPdfViewers } from "./js/pdf_viewer"
import { initDesktopCourseInfoToggle } from "./js/course_info_toggle"
import { initCourseInfoExpander } from "./js/course_expander"

$(document).ready(() => {
  initPdfViewers()
  initDesktopCourseInfoToggle()
  initCourseInfoExpander(document)
  videojs("vid1", {
    controlBar: {
      children: [
        "playToggle",
        "volumePanel",
        "progressControl",
        "currentTimeDisplay",
        "timeDivider",
        "durationDisplay",
        "playbackRateMenuButton",
        "subsCapsButton",
        "qualitySelector",
        "fullscreenToggle"
      ]
    }
  })
})
