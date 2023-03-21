import "./css/www-offline.scss"
import Popper from "popper.js"

export interface OCWWindow extends Window {
  $: JQueryStatic
  jQuery: JQueryStatic
  Popper: typeof Popper
}
declare let window: OCWWindow

window.jQuery = $
window.$ = $
window.Popper = Popper
