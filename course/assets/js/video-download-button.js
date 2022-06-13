//@ts-nocheck
import videojs from "video.js"

function _createDownloadMenuItems() {
  const MenuItems = videojs.getComponent("MenuItem")
  const DownloadMenuItems = videojs.extend(MenuItems, {
    constructor: function(player, options) {
      options.selectable = false
      MenuItems.call(this, player, options)
    },
    handleClick: function() {
      window.open(this.options_.link, "_black").focus()
    }
  })
  MenuItems.registerComponent("DownloadMenuItems", DownloadMenuItems)
}

function _createDownloadbutton() {
  const MenuButton = videojs.getComponent("MenuButton")
  const DownloadMenuButton = videojs.extend(MenuButton, {
    constructor: function(player, options) {
      this.label = document.createElement("span")
      this.values = options.values
      options.label = "download options"

      MenuButton.call(this, player, options)
      this.$("button").classList.add("vjs-download-button")
      this.el().setAttribute("aria-label", "download button")
      this.el().classList.add("download-button-position")
      this.controlText("download button")
    },
    createItems: function() {
      const menuItems = []
      const DownloadMenuItems = videojs.getComponent("DownloadMenuItems")
      this.values.filter((item) => item[1]).map(item => {
        menuItems.push(
          new DownloadMenuItems(this.player_, {
            label:    item[0],
            link: item[1]
          })
        )
      })
      return menuItems
    }
  })
  MenuButton.registerComponent("DownloadMenuButton", DownloadMenuButton)
}

export function initDownloadButton() {
  _createDownloadMenuItems()
  _createDownloadbutton()

  const DownloadMenuButton = videojs.getComponent("DownloadMenuButton")

  if (document.querySelector(".video-container")) {
    const videoPlayers = document.querySelectorAll(".vjs-ocw")
    for (const videoPlayer of Array.from(videoPlayers)) {
      const player = videojs(videoPlayer.id)
      const videoDownloadLink = videoPlayer.getAttribute("data-downloadlink") ?? false
      const transcriptDownloadLink = videoPlayer.getAttribute("data-transcriptLink") ?? false
      const options = [
        [
          "Download video",
          videoDownloadLink
        ],
        [
          "Download transcript",
          transcriptDownloadLink
        ]
      ]
      player.ready(() => {
        const downloadButton = new DownloadMenuButton(player, {
          values: options
        })
        player.controlBar.downloadButton = player.controlBar.el_.insertBefore(
          downloadButton.el_,
          player.controlBar.getChild("fullscreenToggle").el_
        )
        player.controlBar.downloadButton.dispose = function() {
          this.parentNode.removeChild(this)
        }
      })
    }
  }
}
