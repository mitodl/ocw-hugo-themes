import videojs from "video.js"
import "videojs-vjstranscribe"

export const initVideoTranscriptTrack = () => {
  if (document.querySelector(".video-container")) {
    const videoPlayers = document.querySelectorAll(".vjs-ocw")

    for (const videoPlayer of Array.from(videoPlayers)) {
      const player = videojs(videoPlayer.id)
      player.ready(function() {
        // @ts-ignore - TextTrackList has length property in video.js v8
        const hasTextTracks = player.textTracks().length !== 0

        if (hasTextTracks) {
          // Find or create the transcript container
          const videoPage = videoPlayer.closest(".video-page")
          if (videoPage) {
            const transcriptContainer = videoPage
              .querySelector(".transcript")
              ?.querySelector(".video-tab-content-section")

            if (transcriptContainer) {
              // Create a unique ID for the transcript widget
              const widgetId = `transcript-widget-${videoPlayer.id}`

              // Create the widget container if it doesn't exist
              if (!document.getElementById(widgetId)) {
                const widgetElement = document.createElement("div")
                widgetElement.id = widgetId
                transcriptContainer.appendChild(widgetElement)
              }

              // Initialize the vjstranscribe plugin
              const options = {
                widgetId:   widgetId,
                showTitle:  false,
                selector:   false,
                download:   false,
                copy:       false,
                search:     false,
                pip:        false,
                mode:       "line",
                disablecc:  false
              }

              // @ts-expect-error - Plugin types not fully defined
              player.vjstranscribe(options)
            }
          }
        }
      })
    }
  }
}
