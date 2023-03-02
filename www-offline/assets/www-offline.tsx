import Popper from "popper.js"
var lunr = require("lunr")

export interface OCWWindow extends Window {
  $: JQueryStatic
  jQuery: JQueryStatic
  Popper: typeof Popper
  lunr: typeof lunr
}
declare let window: OCWWindow

window.jQuery = $
window.$ = $
window.Popper = Popper
window.lunr = lunr
