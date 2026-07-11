import { fastlyOptimizedGalleryUrl } from "../../../base-theme/assets/js/utils"

export function initImageGalleriesFromMarkup() {
  const galleries = document.querySelectorAll(".image-gallery")
  if (galleries.length === 0) return

  galleries.forEach(gallery => {
    const baseUrl = gallery.getAttribute("data-base-url") || ""

    const links = gallery.querySelectorAll("a[href]")
    const items = Array.from(links).map(link => {
      const src = link.getAttribute("href") || ""
      return {
        src: fastlyOptimizedGalleryUrl(src, baseUrl, {
          format:  "auto",
          quality: "75",
          width:   "1920"
        }),
        srct: fastlyOptimizedGalleryUrl(src, baseUrl, {
          format:  "auto",
          quality: "75",
          width:   "480"
        }),
        title:       link.innerHTML,
        description: link.getAttribute("data-credit") || ""
      }
    })

    // fastlyOptimizedGalleryUrl pre-resolves items when baseUrl is absolute or
    // root-relative (online). Passing itemsBaseURL in that case causes nanogallery2
    // to prepend it again, producing double-path URLs. Only pass it for relative
    // (offline) base URLs where items are left unresolved.
    const isOnlineBase = /^https?:\/\//.test(baseUrl) || baseUrl.startsWith("/")

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.jQuery(gallery).nanogallery2({
      ...(isOnlineBase ? {} : { itemsBaseURL: baseUrl }),
      items:           items,
      allowHTMLinData: true
    })
  })
}
