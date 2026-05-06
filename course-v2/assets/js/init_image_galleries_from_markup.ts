import { fastlyOptimizedGalleryUrl } from "../../../base-theme/assets/js/utils"

export function initImageGalleriesFromMarkup() {
  const galleries = document.querySelectorAll(".image-gallery")
  galleries.forEach(gallery => {
    const baseUrl = gallery.getAttribute("data-base-url") || ""

    const links = gallery.querySelectorAll("a[href]")
    const items = Array.from(links).map(link => {
      const src = link.getAttribute("href") || ""
      return {
        src: fastlyOptimizedGalleryUrl(src, baseUrl, {
          format:  "webp",
          quality: "75",
          width:   "1920"
        }),
        srct: fastlyOptimizedGalleryUrl(src, baseUrl, {
          format:  "webp",
          quality: "75",
          width:   "480"
        }),
        title:       link.innerHTML,
        description: link.getAttribute("data-credit") || ""
      }
    })

    // nanogallery2 renders thumbnails as plain <img> (no <picture>), so WebP
    // thumbnails will fail in non-WebP browsers. Watch for img elements as
    // nanogallery2 creates them (including lazy-loaded ones) and attach an
    // onerror that falls back to format=auto when WebP is not supported.
    const addWebpFallback = (img: HTMLImageElement) => {
      if (img.dataset.webpFallbackSet) return
      img.dataset.webpFallbackSet = "1"
      img.addEventListener(
        "error",
        () => {
          img.src = img.src.replace(/\bformat=webp\b/, "format=auto")
        },
        { once: true }
      )
    }
    const addWebpFallbackFromNode = (node: Node) => {
      if (!(node instanceof Element)) return
      if (node instanceof HTMLImageElement) {
        addWebpFallback(node)
        return
      }
      node.querySelectorAll<HTMLImageElement>("img").forEach(addWebpFallback)
    }
    gallery.querySelectorAll<HTMLImageElement>("img").forEach(addWebpFallback)
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(addWebpFallbackFromNode)
      })
    })
    observer.observe(gallery, { childList: true, subtree: true })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.jQuery(gallery).nanogallery2({
      itemsBaseURL:    baseUrl,
      items:           items,
      allowHTMLinData: true
    })
  })
}
