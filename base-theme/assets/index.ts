import "../../node_modules/tippy.js/dist/tippy.css"

import "./css/main.scss"
import "video.js/dist/video-js.css"

import "bootstrap"
import Popper from "popper.js"
import tippy from "tippy.js"
import "shifty"
import "hammerjs"
import "imagesloaded"
import "screenfull"

import { initSentry } from "./js/sentry"

export interface OCWWindow extends Window {
  $: JQueryStatic
  jQuery: JQueryStatic
  Popper: typeof Popper
}

declare let window: OCWWindow

window.jQuery = $
window.$ = $
window.Popper = Popper

$(document).ready(() => {
  // hacky coming-soon popover
  document.querySelectorAll(".coming-soon").forEach(el => {
    tippy(el, {
      content: "Coming soon!",
      trigger: "click",
      placement: "top"
    })
  })

  initSentry()
})

// &nbsp; causes text to overflow and it doesn't wrap inside a div
// not sure if this is a good approach but I couldn't ANY Hugo template function
// with which we can get rid of &nbsp;
// not wrapping this code in function for better efficiency and to avoid glitch for user
const elements = document.getElementsByClassName("remove-nbsp")
for (let i = 0; i < elements.length; i++) {
  elements[i].innerHTML = elements[i].innerHTML.replace(/&nbsp;/g, " ")
}
