import videojs from "video.js"

export const initVideoTranscriptTrack = () => {
  if (document.querySelector(".video-container")) {
    const videoPlayers = document.querySelectorAll(".vjs-ocw")

    for (const videoPlayer of Array.from(videoPlayers)) {
      videojs(videoPlayer.id).ready(function() {
        // @ts-expect-error TODO
        window.videojs = videojs
        require("videojs-transcript-ac")

        const options = {
          showTitle:         false,
          showTrackSelector: false
        }

        // @ts-expect-error TODO
        const transcript = this.transcript(options)

        if (videoPlayer.closest(".video-page")) {
          // @ts-expect-error TODO
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
