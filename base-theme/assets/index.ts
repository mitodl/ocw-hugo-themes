import "./css/main.scss"

import "bootstrap"
import Popper from "popper.js"
import "./js/utils"
import * as Sentry from "@sentry/browser"
import { initSentry } from "./js/sentry"
import PDFObject from "pdfobject"
import "./js/polyfill"
import "video.js/dist/video-js.css"
import { initExternalLinkModal } from "./js/external_link_modal"
import { initVideoDownloadPopup } from "./js/video_download_popup"

export interface OCWWindow extends Window {
  $: JQueryStatic
  jQuery: JQueryStatic
  Popper: typeof Popper
  Sentry: typeof Sentry
  PDFObject: typeof PDFObject
  initVideoJS: () => void
}

declare let window: OCWWindow

window.jQuery = $
window.$ = $
window.Popper = Popper
window.PDFObject = PDFObject

let videoJSLoaded = false

window.initVideoJS = () => {
  if (videoJSLoaded) return
  initVideoDownloadPopup()
  import("./videojs-imports").then(module => {
    module.initVideoJS()
  })
  videoJSLoaded = true
}

$(function() {
  window.Sentry = initSentry()
  initExternalLinkModal()
})
