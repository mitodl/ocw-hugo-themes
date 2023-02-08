import "./css/main.scss"

import "bootstrap"
import Popper from "popper.js"
import "./js/utils"
import * as Sentry from "@sentry/browser"
import { initSentry } from "./js/sentry"
import PDFObject from "pdfobject"
import "./js/polyfill"

export interface OCWWindow extends Window {
  test: string
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
window.test = "String"

$(function() {
  window.Sentry = initSentry()
})
