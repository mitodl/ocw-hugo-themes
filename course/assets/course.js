import "../../node_modules/nanogallery2/src/css/nanogallery2.css"

import "offcanvas-bootstrap/dist/js/bootstrap.offcanvas.js"
import "nanogallery2/src/jquery.nanogallery2.core.js"

import "./css/course.scss"
import "videojs-youtube"

import { initPdfViewers } from "../../base-theme/assets/js/pdf_viewer"
import { initDesktopCourseInfoToggle } from "./js/course_info_toggle"
import { initDivToggle } from "./js/div_toggle"
import { initCourseInfoExpander } from "./js/course_expander"
import { initVideoTranscriptTrack } from "./js/video_transcript_track"
import { initPlayBackSpeedButton } from "./js/video_playback_speed"
import { initVideoFullscreenToggle } from "./js/video_fullscreen_toggle"
import {
  clearSolution,
  checkAnswer,
  showSolution
} from "./js/quiz_multiple_choice"

$(function() {
  initPdfViewers()
  initDesktopCourseInfoToggle()
  initCourseInfoExpander(document)
  initVideoTranscriptTrack()
  initPlayBackSpeedButton()
  initDivToggle()
  clearSolution()
  checkAnswer()
  showSolution()
  initVideoFullscreenToggle()
})
