import fsSync from "node:fs"
import path from "node:path"
import PDFDocument from "pdfkit"
import type {
  ImageMeta,
  PageLayout,
  PDFDoc,
  GenerateOptions,
} from "../types.js"
import { normalizeOptions } from "../config.js"
import { ensureDir } from "../utils/fs.js"
import { drawCover } from "../templates/cover.js"

function addImagePage(
  doc: PDFDoc,
  img: ImageMeta,
  pageLayout: PageLayout,
  margin: number,
  headerBox: number
) {
  doc.addPage({ size: "A4", layout: pageLayout })

  const pageW = doc.page.width
  const pageH = doc.page.height

  // Cabeçalho
  const header = `${img.project} — ${path.basename(img.relPath)}`
  doc
    .font("Helvetica")
    .fontSize(14)
    .text(header, margin, margin, { width: pageW - margin * 2, align: "left" })

  // Área disponível para a imagem
  const availW = pageW - margin * 2
  const availH = pageH - margin * 2 - headerBox

  doc.image(img.absPath, margin, margin + headerBox, {
    fit: [availW, availH],
    align: "center",
    valign: "center",
  })
}

export async function generatePdf(
  options: GenerateOptions,
  images: ImageMeta[]
) {
  const opts = normalizeOptions(options)

  if (images.length === 0) throw new Error("Nenhuma imagem encontrada.")

  await ensureDir(path.dirname(opts.outFile))

  const stream = fsSync.createWriteStream(opts.outFile)
  const doc = new PDFDocument({
    autoFirstPage: false,
    pdfVersion: "1.7",
    compress: true,
  })
  doc.pipe(stream)

  // Capa
  drawCover(doc, opts.title, opts.locale)

  // Páginas
  for (const img of images) {
    const landscape = img.width / img.height > 1.2
    addImagePage(
      doc,
      img,
      landscape ? "landscape" : "portrait",
      opts.margin,
      opts.headerBox
    )
  }

  doc.end()

  await new Promise<void>((res, rej) => {
    stream.on("finish", () => res())
    stream.on("error", rej)
  })
}
