/**
 * Appends Fastly Image Optimizer query params to an image URL.
 * Only applies to absolute (http/https) or root-relative (/) URLs;
 * relative paths (offline) are returned unchanged.
 */
function fastlyOptimizedUrl(
  url: string,
  params: Record<string, string>
): string {
  if (!url || (!url.startsWith("http") && !url.startsWith("/"))) return url
  const separator = url.includes("?") ? "&" : "?"
  const qs = Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join("&")
  return `${url}${separator}${qs}`
}

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
        title:       link.innerHTML,
        description: link.getAttribute("data-credit") || ""
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
