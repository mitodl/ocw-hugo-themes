import "./css/www-offline.scss"
import Fuse from "fuse.js"

export interface OCWWindow extends Window {
  $: JQueryStatic
  jQuery: JQueryStatic
  Fuse: typeof Fuse
}
declare let window: OCWWindow

window.jQuery = $
window.$ = $
window.Fuse = Fuse
