//@ts-nocheck
import videojs from "video.js"

/**
 * Switch the active text track on a Video.js player to the one matching lang.
 * Disables all other tracks of kind "captions" / "subtitles".
 * Returns the newly-activated track, or null if not found.
 */
function switchActiveTrack(player, lang) {
  const tracks = player.textTracks()
  // Prefer exact BCP-47 match; fall back to first base-language match.
  let exactMatch = null
  let baseMatch = null
  const baseBtnLang = lang.split("-")[0]
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i]
    if (track.kind === "captions" || track.kind === "subtitles") {
      const trackLang = track.language || ""
      if (trackLang === lang && !exactMatch) {
        exactMatch = track
      } else if (trackLang.split("-")[0] === baseBtnLang && !baseMatch) {
        baseMatch = track
      }
    }
  }
  const chosen = exactMatch || baseMatch
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i]
    if (track.kind === "captions" || track.kind === "subtitles") {
      track.mode = track === chosen ? "showing" : "disabled"
    }
  }
  return chosen
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
    transcriptContainer.appendChild(transcript.el())
  }
}

export const initVideoTranscriptTrack = () => {
  if (document.querySelector(".video-container")) {
    // Toggle .transcript-tab-expanded on the toggle section when the transcript
    // panel opens/closes. This must run eagerly (before videojs.ready) so the
    // lang bar is visible even if the player initialises after the tab is clicked.
    // (JS fallback for CSS :has(), which is not supported in Firefox < 121.)
    document.querySelectorAll(".video-page").forEach(videoPage => {
      const transcriptTab = videoPage.querySelector(".transcript")
      const langBar = videoPage.querySelector(".transcript-lang-bar")
      const langBarToggleSection = langBar?.previousElementSibling
      if (langBar && langBarToggleSection && transcriptTab) {
        transcriptTab.addEventListener("show.bs.collapse", () => {
          langBarToggleSection.classList.add("transcript-tab-expanded")
        })
        transcriptTab.addEventListener("hide.bs.collapse", () => {
          langBarToggleSection.classList.remove("transcript-tab-expanded")
        })
      }
    })

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
        const langOptions = videoPage.querySelectorAll(
          ".transcript-lang-option"
        )

        // Auto-mount the transcript:
        //   1. Immediately on ready – so cues are in the DOM when the user opens
        //      the tab (VTT cues may still be loading when show.bs.collapse fires).
        //   2. On every tab open – so switching back after close re-renders, and
        //      language-switch re-mounts get a clean container.
        if (transcriptContainer) {
          remountTranscript(player, transcriptContainer, transcriptOptions)
          transcriptTab?.addEventListener("show.bs.collapse", () => {
            remountTranscript(player, transcriptContainer, transcriptOptions)
          })
        }

        langOptions.forEach(option => {
          option.addEventListener("click", () => {
            const lang = option.getAttribute("data-lang")
            if (lang) {
              switchActiveTrack(player, lang)
              if (transcriptContainer) {
                remountTranscript(
                  player,
                  transcriptContainer,
                  transcriptOptions
                )
              }
            }
          })
        })
      })
    }
  }
}
