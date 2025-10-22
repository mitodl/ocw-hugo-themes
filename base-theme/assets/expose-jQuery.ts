export interface OCWWindow extends Window {
  jQuery: JQueryStatic
}

declare let window: OCWWindow
window.jQuery = $;
