/* global $:false */
/* eslint-disable no-console */
export const initPdfViewers = () => {
  $(".pdf-wrapper").each(async (index, pdfWrapper) => {
    const pdfUrl = pdfWrapper.dataset.pdfurl
    const response = await window.fetch(pdfUrl)
    if (response.status !== 200) {
      console.error(`Problem fetching PDF: ${response.status}`)
      return
    }
    const blob = await response.blob()
    const blobURI = window.URL.createObjectURL(blob)
    const viewerUrl = `/pdfjs/web/viewer.html?file=${encodeURIComponent(
      blobURI
    )}`
    $(pdfWrapper).html(
      `<iframe class="w-100 h-100" frameborder="0" scrolling="yes" seamless="seamless" src="${viewerUrl}"></iframe>`
    )
  })
}
