export interface OCWWindow extends Window {
  $: JQueryStatic
}
    
declare let window: OCWWindow

export function initImageGalleriesFromMarkup() {
    const galleries = document.querySelectorAll('.image-gallery')
    galleries.forEach(gallery => {
        const baseUrl = gallery.getAttribute('data-base-url')

        // Extract image data from existing HTML markup
        const links = gallery.querySelectorAll('a[href]')
        const items = Array.from(links).map(link => (
            {
                src: link.getAttribute('href'),
                title: link.innerHTML
            }
        ))

        // Initialize nanogallery2 with JavaScript API
        window.$(gallery).nanogallery2({
            itemsBaseURL: baseUrl,
            items: items,
            allowHTMLinData: true,
        })
    })
}
