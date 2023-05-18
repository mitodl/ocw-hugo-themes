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
import { initVideoDownloadPopup } from "../../course-v2/assets/js/video_download_popup"
import { initVideoTranscriptTrack } from "../../course-v2/assets/js/video_transcript_track"
import { initPlayBackSpeedButton } from "../../course-v2/assets/js/video_playback_speed"
import { initVideoFullscreenToggle } from "../../course-v2/assets/js/video_fullscreen_toggle"
import { initDownloadButton } from "../../course-v2/assets/js/video-download-button"
import "nanogallery2/src/jquery.nanogallery2.core.js"
import "nanogallery2/src/css/nanogallery2.css"
import "videojs-youtube"

$(function() {
  initCourseDescriptionExpander(document)
  initCourseInfoExpander(document)
  initDivToggle()
  clearSolution()
  checkAnswer()
  showSolution()
  initCourseDrawersClosingViaSwiping()
})

export const initVideoJS = () => {
  initVideoDownloadPopup()
  initDownloadButton()
  initPlayBackSpeedButton()
  initVideoTranscriptTrack()
  initVideoFullscreenToggle()
}
