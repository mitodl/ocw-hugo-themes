import "./css/www-offline.scss"
import Fuse from "fuse.js"
import Popper from "popper.js"

export interface OCWWindow extends Window {
  $: JQueryStatic
  jQuery: JQueryStatic
  Popper: typeof Popper
  Fuse: typeof Fuse
}
declare let window: OCWWindow

window.jQuery = $
window.$ = $
window.Popper = Popper
window.Fuse = Fuse
