//@ts-nocheck
import videojs from "video.js"

function _initMenuItems() {
  const MenuItems = videojs.getComponent("MenuItem")
  const SettingMenuItems = videojs.extend(MenuItems, {
    constructor: function(player, options) {
      options.selectable = true
      MenuItems.call(this, player, options)
      player.on("onPlaybackRateChange", videojs.bind(this, this.update))
    },
    handleClick: function() {
      this.player_.tech_.ytPlayer.setPlaybackRate(this.options_.label)
      this.player_.currentPlaybackRate = this.options_.label
      this.player_.trigger("onPlaybackRateChange")
    },
    update: function() {
      const selection = this.player_.currentPlaybackRate
      this.selected(this.options_.label === selection)
    }
  })
  MenuItems.registerComponent("SettingMenuItems", SettingMenuItems)
}

function _initMenuButton() {
  const MenuButton = videojs.getComponent("MenuButton")
  const SettingMenuButton = videojs.extend(MenuButton, {
    constructor: function(player, options) {
      this.label = document.createElement("span")
      this.playbackSpeeds = options.playbackSpeeds
      options.label = "playback speed"

      MenuButton.call(this, player, options)
      this.$("button").classList.add("vjs-quality-selector")
      this.el().setAttribute("aria-label", "playback speed")
      this.el().classList.add("playback-button-position")
      this.controlText("playback speed")
    },
    createItems: function() {
      const menuItems = []
      const SettingMenuItems = videojs.getComponent("SettingMenuItems")
      this.playbackSpeeds.map(item => {
        menuItems.push(
          new SettingMenuItems(this.player_, {
            label:    item,
            selected: item === this.player_.playbackRate()
          })
        )
      })
      return menuItems
    }
  })

  // ready function
  MenuButton.registerComponent("SettingMenuButton", SettingMenuButton)
}

export const initPlayBackSpeedButton = () => {
  _initMenuItems()
  _initMenuButton()

  const SettingMenuButton = videojs.getComponent("SettingMenuButton")

  if (document.querySelector(".video-container")) {
    const videoPlayers = document.querySelectorAll(".vjs-ocw")
    for (const videoPlayer of Array.from(videoPlayers)) {
      const player = videojs(videoPlayer.id)
      player.ready(function() {
        const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5]
        const menuButton = new SettingMenuButton(player, {
          playbackSpeeds: playbackRates,
          title:          "Playback speed"
        })
        player.controlBar.resolutionSwitcher = player.controlBar.el_.insertBefore(
          menuButton.el_,
          player.controlBar.el().lastChild.nextSibling
        )
        player.controlBar.resolutionSwitcher.dispose = function() {
          this.parentNode.removeChild(this)
        }
      })
    }
  }
}
