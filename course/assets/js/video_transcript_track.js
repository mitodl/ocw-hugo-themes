import videojs from "video.js"

export const initVideoTranscriptTrack = () => {
  if (document.querySelector(".video-container")) {
    const videoPlayers = document.querySelectorAll(".vjs-ocw")

    for (const videoPlayer of videoPlayers) {
      videojs(videoPlayer.id).ready(function() {
        window.videojs = videojs
        require("videojs-transcript-ac")

        const options = {
          showTitle:         false,
          showTrackSelector: false
        }

        const transcript = this.transcript(options)

        if (videoPlayer.closest(".video-page")) {
          const transcriptContainer = videoPlayer
            .closest(".video-page")
            .querySelector(".transcript")

          if (transcriptContainer) {
            transcriptContainer.appendChild(transcript.el())
          }
        }
      })
    }
  }
}
