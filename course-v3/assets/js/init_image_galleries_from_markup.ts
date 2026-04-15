import { fastlyOptimizedUrl } from "../../../base-theme/assets/js/utils"

export function initImageGalleriesFromMarkup() {
  const galleries = document.querySelectorAll(".image-gallery")
  galleries.forEach(gallery => {
    const baseUrl = gallery.getAttribute("data-base-url")

    const links = gallery.querySelectorAll("a[href]")
    const items = Array.from(links).map(link => {
      const src = link.getAttribute("href") || ""
      return {
        src,
        srct: fastlyOptimizedUrl(src, {
          format:  "avif",
          quality: "60",
          width:   "480"
        }),
        title: link.innerHTML
      }
    })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.jQuery(gallery).nanogallery2({
      itemsBaseURL:    baseUrl,
      items:           items,
      allowHTMLinData: true
    })
  })
}
