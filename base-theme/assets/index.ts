import "./css/main.scss"
import "video.js/dist/video-js.css"

import "bootstrap"
import Popper from "popper.js"
import "shifty"
import "hammerjs"
import "imagesloaded"
import "screenfull"
import "./js/utils"
import * as Sentry from "@sentry/browser"
import { initSentry } from "./js/sentry"
import PDFObject from "pdfobject"
import "./js/polyfill"

export interface OCWWindow extends Window {
  $: JQueryStatic
  jQuery: JQueryStatic
  Popper: typeof Popper
  Sentry: typeof Sentry
  PDFObject: typeof PDFObject
}

declare let window: OCWWindow

window.jQuery = $
window.$ = $
window.Popper = Popper
window.PDFObject = PDFObject

$(function() {
  window.Sentry = initSentry()
})
