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
  // Remove any existing transcript DOM mounted by the plugin
  const existing = transcriptContainer.querySelector(".transcript")
  if (existing) existing.remove()

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

  // @ts-expect-error TODO
  const transcript = player.transcript(options)
  if (transcript) {
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

        let transcript = null
        const hasTextTracks = this.textTracks().length !== 0

        if (hasTextTracks) {
          // @ts-expect-error TODO
          transcript = this.transcript(transcriptOptions)
        }

        const videoPage = videoPlayer.closest(".video-page")
        if (!videoPage) return

        const transcriptTab = videoPage.querySelector(".transcript")
        const transcriptContainer = transcriptTab?.querySelector(
          ".video-tab-content-section"
        )

        if (transcript && transcriptContainer) {
          transcriptContainer.appendChild(transcript.el())
        }

        // Wire up language selector dropdown (present when > 1 caption track)
        const langSelect = videoPage.querySelector(".transcript-lang-select")
        if (!langSelect) return

        const player = this
        langSelect.addEventListener("change", () => {
          const lang = langSelect.value

          // Switch the active VTT track on the player
          switchActiveTrack(player, lang)

          // Re-mount the transcript panel with the newly active track
          if (transcriptContainer) {
            remountTranscript(player, transcriptContainer, transcriptOptions)
          }
        })
      })
    }
  }
}
