
import { initVideoTranscriptTrack } from "./js/video_transcript_track"
import { initPlayBackSpeedButton } from "./js/video_playback_speed"
import { initVideoFullscreenToggle } from "./js/video_fullscreen_toggle"
import { initDownloadButton } from "./js/video-download-button"

import "video.js/dist/video-js.css"
import "videojs-youtube"

$(function() {
  initDownloadButton()
  initPlayBackSpeedButton()
  initVideoTranscriptTrack()
  initVideoFullscreenToggle()
})
