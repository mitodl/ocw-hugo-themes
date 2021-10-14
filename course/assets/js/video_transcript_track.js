import videojs from "video.js"

export const initVideoTranscriptTrack = () => {
  if (document.querySelector("#video-player")) {
    videojs("video-player").ready(function() {
      window.videojs = videojs
      require("videojs-transcript-ac")

      const options = {
        showTitle:         false,
        showTrackSelector: false
      }

      const transcript = this.transcript(options)

      const transcriptContainer = document.querySelector("#transcript")
      transcriptContainer.appendChild(transcript.el())
    })
  }
}
