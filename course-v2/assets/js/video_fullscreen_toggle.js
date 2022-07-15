// @ts-nocheck

export const initVideoFullscreenToggle = () => {
  // this fixes the issue of control bar going to the top on fullscreen
  $(document).on(
    "mozfullscreenchange webkitfullscreenchange fullscreenchange",
    function() {
      const fullscreenElement =
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      if (fullscreenElement) {
        // entering full screen
        $(".vjs-control-bar").css("bottom", 0)
      } else {
        // exiting full screen
        $(".vjs-control-bar").css("bottom", "auto")
      }
    }
  )
}
