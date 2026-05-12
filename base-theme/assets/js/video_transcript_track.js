//@ts-nocheck
import videojs from "video.js"

/**
 * Switch the active text track on a Video.js player to the one matching lang.
 * Disables all other tracks of kind "captions" / "subtitles".
 * Returns the newly-activated track, or null if not found.
 */
function switchActiveTrack(player, lang) {
  const tracks = player.textTracks()
  let matched = null
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i]
    if (track.kind === "captions" || track.kind === "subtitles") {
      // BCP-47 comparison: "en-US" matches button lang="en" and lang="en-US"
      const trackLang = track.language || ""
      const baseTrackLang = trackLang.split("-")[0]
      const baseBtnLang = lang.split("-")[0]
      const isMatch = trackLang === lang || baseTrackLang === baseBtnLang
      track.mode = isMatch ? "showing" : "disabled"
      if (isMatch) matched = track
    }
  }
  return matched
}

/**
 * Re-mount the transcript plugin for a new active track.
 * videojs-transcript-ac creates the transcript from whichever track is
 * currently "showing", so we just re-call this.transcript() after switching.
 */
function remountTranscript(player, transcriptContainer, options) {
  // Remove all previously mounted transcript plugin elements.
  // The plugin creates a <div id="transcript-{playerId}"> (no CSS class),
  // so we clear the container entirely to avoid stacking on repeated language switches.
  transcriptContainer.innerHTML = ""
  transcriptContainer.setAttribute("data-transcript-empty", "true")

  const hasTextTracks = player.textTracks().length !== 0
  if (!hasTextTracks) return

  // Ensure at least one track is in 'showing' mode so the plugin can load cues
  const tracks = player.textTracks()
  let hasShowing = false
  for (let i = 0; i < tracks.length; i++) {
    if (tracks[i].mode === "showing") {
      hasShowing = true
      break
    }
  }
  if (!hasShowing && tracks.length > 0) {
    tracks[0].mode = "showing"
  }

  const transcript = player.transcript(options)
  if (transcript) {
    transcriptContainer.removeAttribute("data-transcript-empty")
    transcriptContainer.appendChild(transcript.el())
  }
}

export const initVideoTranscriptTrack = () => {
  if (document.querySelector(".video-container")) {
    const videoPlayers = document.querySelectorAll(".vjs-ocw")

    for (const videoPlayer of Array.from(videoPlayers)) {
      videojs(videoPlayer.id).ready(function() {
        // @ts-expect-error TODO
        window.videojs = videojs
        require("videojs-transcript-ac")

        const transcriptOptions = {
          showTitle:         false,
          showTrackSelector: false
        }

        const videoPage = videoPlayer.closest(".video-page")
        if (!videoPage) return

        const transcriptTab = videoPage.querySelector(".transcript")
        const transcriptContainer = transcriptTab?.querySelector(
          ".video-tab-content-section"
        )

        const player = this

        // Wire up language selector (option buttons inside the transcript-lang-dropdown).
        // The transcript pane is intentionally left empty until the user picks a language.
        const langOptions = videoPage.querySelectorAll(".transcript-lang-option")

        if (langOptions.length > 1) {
          // Multi-lang: mount transcript only when a language option is clicked.
          langOptions.forEach(option => {
            option.addEventListener("click", () => {
              const lang = option.getAttribute("data-lang")
              if (lang) {
                switchActiveTrack(player, lang)
                if (transcriptContainer) {
                  remountTranscript(player, transcriptContainer, transcriptOptions)
                }
              }
            })
          })
        } else {
          // Single-lang (0 or 1 option): auto-mount immediately on player ready,
          // matching the original behaviour so transcript lines are in the DOM
          // even while the tab is visually collapsed.
          if (transcriptContainer) {
            remountTranscript(player, transcriptContainer, transcriptOptions)
          }
        }
      })
    }
  }
}
