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

              // Add compatibility classes for e2e tests
              // The new plugin uses .vjs-transcribe-cueline, but tests expect .transcript-line
              const addCompatibilityClasses = () => {
                const widget = document.getElementById(widgetId)
                if (widget) {
                  // Add transcript-line class to all cueline elements
                  const cueLines = widget.querySelectorAll(".vjs-transcribe-cueline")
                  cueLines.forEach(cueLine => {
                    cueLine.classList.add("transcript-line")

                    // Map data-begin attribute if it exists
                    const time = cueLine.querySelector(".vjs-transcribe-cuetimestamp")?.textContent
                    if (time) {
                      // Convert time format to seconds for data-begin attribute
                      const timeMatch = time.match(/(\d+):(\d+)/)
                      if (timeMatch) {
                        const minutes = parseInt(timeMatch[1], 10)
                        const seconds = parseInt(timeMatch[2], 10)
                        const totalSeconds = minutes * 60 + seconds
                        cueLine.setAttribute("data-begin", totalSeconds.toString())
                      }
                    }
                  })

                  // Observe for active state changes and map to is-active class
                  const observer = new MutationObserver(mutations => {
                    mutations.forEach(mutation => {
                      if (mutation.type === "attributes" && mutation.attributeName === "class") {
                        const target = mutation.target
                        // @ts-ignore - target is an Element with classList
                        if (target.classList.contains("cue-active")) {
                          // @ts-ignore - target is an Element with classList
                          target.classList.add("is-active")
                        } else {
                          // @ts-ignore - target is an Element with classList
                          target.classList.remove("is-active")
                        }
                      }
                    })
                  })

                  // Observe all cueline elements for class changes
                  cueLines.forEach(cueLine => {
                    observer.observe(cueLine, { attributes: true, attributeFilter: ["class"] })
                    // Also add is-active if it already has cue-active
                    if (cueLine.classList.contains("cue-active")) {
                      cueLine.classList.add("is-active")
                    }
                  })
                }
              }

              // Wait for plugin to render then add compatibility classes
              setTimeout(addCompatibilityClasses, 500)
            }
          }
        }
      })
    }
  }
}
