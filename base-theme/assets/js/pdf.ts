import PDFObject from "pdfobject"

export const embedPdf = (containerId: string, pdfUrl: string, options: any) => {
  PDFObject.embed(containerId, pdfUrl, options)
}
