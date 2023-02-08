type InitVideoJS = () => Promise<typeof import("./videojs-imports")>

export interface OCWWindow extends Window {
  initVideoJS: InitVideoJS
}
declare let window: OCWWindow

window.initVideoJS = function() {
  return import("./videojs-imports.js")
}
