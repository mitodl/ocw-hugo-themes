import { initVideoTranscriptTrack } from "./js/video_transcript_track"
import { initPlayBackSpeedButton } from "./js/video_playback_speed"

import "videojs-youtube"

export const initVideoJS = () => {
  initPlayBackSpeedButton()
  initVideoTranscriptTrack()
}
