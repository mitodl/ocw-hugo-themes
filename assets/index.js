import "../node_modules/tippy.js/dist/tippy.css"

import "./css/main.scss"

import "bootstrap"
import Popper from "popper.js"
import tippy from "tippy.js"
import "shifty"
import "hammerjs"
import "imagesloaded"
import "screenfull"


import { initSentry } from "./js/sentry"

window.jQuery = $
window.$ = $
window.Popper = Popper

$(document).ready(() => {
  // hacky coming-soon popover
  document.querySelectorAll(".coming-soon").forEach(el => {
    tippy(el, {
      content:   "Coming soon!",
      trigger:   "click",
      placement: "top"
    })
  })

  initSentry()
})
