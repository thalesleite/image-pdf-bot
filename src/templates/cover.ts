import type { PDFDoc } from "../types.js"

export function drawCover(doc: PDFDoc, title: string, locale: string) {
  doc.addPage({ size: "A4", layout: "portrait" })
  const margin = 40
  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .text(title, margin, 200, {
      width: doc.page.width - margin * 2,
      align: "center",
    })

  doc.moveDown()
  const dateStr = new Date().toLocaleString(locale)
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(`Generated in: ${dateStr}`, {
      width: doc.page.width - margin * 2,
      align: "center",
    })
}
