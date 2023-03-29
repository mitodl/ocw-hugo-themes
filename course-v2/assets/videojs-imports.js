import { initVideoTranscriptTrack } from "./js/video_transcript_track"
import { initPlayBackSpeedButton } from "./js/video_playback_speed"
import { initVideoFullscreenToggle } from "./js/video_fullscreen_toggle"
import { initDownloadButton } from "./js/video-download-button"
import { videoToggleDownloadPopup } from "./js/video_toggle_download"

import "videojs-youtube"

export const initVideoJS = () => {
  initDownloadButton()
  initPlayBackSpeedButton()
  initVideoTranscriptTrack()
  initVideoFullscreenToggle()
  videoToggleDownloadPopup()
}
