import videojs from "video.js"

export const initVideoTranscriptTrack = () => {
  if (document.querySelector(".video-container")) {
    const videoPlayers = document.querySelectorAll(".vjs-ocw")

    for (const videoPlayer of Array.from(videoPlayers)) {
      videojs(videoPlayer.id).ready(function() {
        // @ts-ignore
        window.videojs = videojs
        require("videojs-transcript-ac")

        const options = {
          showTitle:         false,
          showTrackSelector: false
        }

        // @ts-ignore
        const transcript = this.transcript(options)

        if (videoPlayer.closest(".video-page")) {
          // @ts-ignore
          const transcriptContainer = videoPlayer
            .closest(".video-page")
            .querySelector(".transcript")
            ?.querySelector(".video-tab-content-section")

          if (transcriptContainer) {
            transcriptContainer.appendChild(transcript.el())
          }
        }
      })
    }
  }
}
