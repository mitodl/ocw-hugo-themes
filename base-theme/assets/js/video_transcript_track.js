import videojs from "video.js"

export const initVideoTranscriptTrack = () => {
  if (document.querySelector(".video-container")) {
    const videoPlayers = document.querySelectorAll('[data-transcript-enabled="true"]')

    for (const videoPlayer of Array.from(videoPlayers)) {
      videojs(videoPlayer.id).ready(function() {
        // @ts-expect-error TODO
        window.videojs = videojs
        require("videojs-transcript-ac")

        let transcript = null
        const hasTextTracks = this.textTracks().length !== 0

        if (hasTextTracks) {
          const options = {
            showTitle:         false,
            showTrackSelector: false
          }

          // @ts-expect-error TODO
          transcript = this.transcript(options)
        }

        if (videoPlayer.closest(".video-page")) {
          // @ts-expect-error TODO
          const transcriptContainer = videoPlayer
            .closest(".video-page")
            .querySelector(".transcript")
            ?.querySelector(".video-tab-content-section")

          if (transcript && transcriptContainer) {
            transcriptContainer.appendChild(transcript.el())
          }
        }
      })
    }
  }
}
