import videojs from "video.js"

export const initVideoTranscriptTrack = () => {
  if (document.querySelector(".video-container")) {
    const videoPlayers = document.querySelectorAll(".vjs-ocw")

    for (const videoPlayer of Array.from(videoPlayers)) {
      const player = videojs(videoPlayer.id)
      player.ready(function() {
        // @ts-expect-error TODO
        window.videojs = videojs
        require("videojs-transcript-ac")

        let transcript = null
        // @ts-ignore - TextTrackList has length property in video.js v8
        const hasTextTracks = player.textTracks().length !== 0

        if (hasTextTracks) {
          const options = {
            showTitle:         false,
            showTrackSelector: false
          }

          // @ts-expect-error TODO
          transcript = player.transcript(options)
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
