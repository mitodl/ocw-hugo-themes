//@ts-nocheck
import videojs from "video.js"

export const initSettingButton = () => {
  const MenuButton = videojs.getComponent("MenuButton")
  const ResolutionMenuButton = videojs.extend(MenuButton, {
    constructor: function (player, options) {
      this.label = document.createElement("span")
      options.label = "Quality"
      // Sets this.player_, this.options_ and initializes the component
      MenuButton.call(this, player, options)
      this.$("button").classList.add("vjs-quality-selector")
      this.el().setAttribute("aria-label", "Quality")
      this.el().classList.add("right")
      this.controlText("Quality")

      if (options.dynamicLabel) {
        videojs.dom.addClass(this.label, "vjs-resolution-button-label")
        this.el().appendChild(this.label)
      } else {
        const staticLabel = document.createElement("span")
        videojs.dom.addClass(staticLabel, "vjs-menu-icon")
        this.el().appendChild(staticLabel)
      }
      player.on("updateSources", videojs.bind(this, this.update))
    }
  })
  MenuButton.registerComponent("ResolutionMenuButton", ResolutionMenuButton)
  if (document.querySelector(".video-container")) {
    const videoPlayers = document.querySelectorAll(".vjs-ocw")
    for (const videoPlayer of Array.from(videoPlayers)) {
      const player = videojs(videoPlayer.id)
      player.ready(() => {
        const menuButton = new ResolutionMenuButton(player, {});
        player.controlBar.resolutionSwitcher = player.controlBar.el_.insertBefore(menuButton.el_, player.controlBar.getChild('fullscreenToggle').el_);
        player.controlBar.resolutionSwitcher.dispose = function () {
          this.parentNode.removeChild(this)
        };
      })
    }
  }
}
