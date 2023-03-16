import { initVideoTranscriptTrack } from "./js/video_transcript_track"
import { initPlayBackSpeedButton } from "./js/video_playback_speed"
import { initVideoFullscreenToggle } from "./js/video_fullscreen_toggle"
import { initDownloadButton } from "./js/video-download-button"

import "videojs-youtube"
// @ts-ignore
window.Promise = undefined
import "promise-polyfill/src/polyfill"

export const initVideoJS = () => {
  initDownloadButton()
  initPlayBackSpeedButton()
  initVideoTranscriptTrack()
  initVideoFullscreenToggle()
}
