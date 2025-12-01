export function initImageGalleriesFromMarkup() {
  const galleries = document.querySelectorAll(".image-gallery")
  galleries.forEach(gallery => {
    const baseUrl = gallery.getAttribute("data-base-url")

    const links = gallery.querySelectorAll("a[href]")
    const items = Array.from(links).map(link => ({
      src:         link.getAttribute("href"),
      title:       link.innerHTML,
      description: link.getAttribute("data-credit") || ""
    }))

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.jQuery(gallery).nanogallery2({
      itemsBaseURL:    baseUrl,
      items:           items,
      allowHTMLinData: true
    })
  })
}
