// build-image-pdf.ts
import fs from "node:fs/promises"
import fssync from "node:fs"
import path from "node:path"
import PDFDocument from "pdfkit"
import { imageSize } from "image-size"

type PDFDoc = InstanceType<typeof PDFDocument>

type Img = {
  absPath: string
  relPath: string
  project: string
  width: number
  height: number
  ext: string
}

const SUPPORTED = new Set([".jpg", ".jpeg", ".png"])

async function exists(p: string) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = []
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walk(full)))
    else out.push(full)
  }
  return out
}

function firstFolderAfter(root: string, file: string) {
  const rel = path.relative(root, path.dirname(file))
  if (!rel || rel === "" || rel === ".") return "root"
  return rel.split(path.sep)[0]!
}

async function gatherImages(root: string): Promise<Img[]> {
  const files = await walk(root)
  const imgs: Img[] = []

  for (const abs of files) {
    const ext = path.extname(abs).toLowerCase()
    if (!SUPPORTED.has(ext)) continue

    // image-size (tipagens novas): use Buffer/Uint8Array
    const bytes = await fs.readFile(abs)
    const dims = imageSize(bytes)
    if (!dims?.width || !dims?.height) continue

    const rel = path.relative(root, abs)
    imgs.push({
      absPath: abs,
      relPath: rel,
      project: firstFolderAfter(root, abs), // ex.: "1.project"
      width: dims.width,
      height: dims.height,
      ext,
    })
  }

  // ordena por projeto e nome de arquivo
  imgs.sort(
    (a, b) =>
      a.project.localeCompare(b.project, undefined, { numeric: true }) ||
      a.relPath.localeCompare(b.relPath, undefined, { numeric: true })
  )

  return imgs
}

function addImagePage(
  doc: PDFDoc,
  img: Img,
  pageLayout: "portrait" | "landscape"
) {
  doc.addPage({ size: "A4", layout: pageLayout })

  const margin = 40
  const headerBox = 36 // altura reservada para o cabeçalho
  const pageW = doc.page.width
  const pageH = doc.page.height

  // Cabeçalho
  const header = `${img.project} — ${path.basename(img.relPath)}`
  doc.font("Helvetica").fontSize(14)
  doc.text(header, margin, margin, { width: pageW - margin * 2, align: "left" })

  // Área disponível para a imagem
  const availW = pageW - margin * 2
  const availH = pageH - margin * 2 - headerBox

  // Ajuste proporcional (contain) centralizado
  const x = margin
  const y = margin + headerBox
  doc.image(img.absPath, x, y, {
    fit: [availW, availH],
    align: "center",
    valign: "center",
  })
}

function getFlagValue(args: string[], flag: string): string {
  const i = args.indexOf(flag)
  const v = args[i + 1] // <- capture first
  if (i === -1 || v === undefined || v.startsWith("--")) {
    throw new Error(`Parâmetro ausente: ${flag}`)
  }
  return v
}

async function main() {
  const args = process.argv.slice(2)

  let root: string
  let out: string
  try {
    root = path.resolve(getFlagValue(args, "--root"))
    out = path.resolve(getFlagValue(args, "--out"))
  } catch {
    console.error(
      "Uso: ts-node build-image-pdf.ts --root <pasta_raiz> --out <arquivo.pdf>"
    )
    process.exit(1)
    return
  }

  if (!(await exists(root))) {
    console.error("Pasta raiz não encontrada:", root)
    process.exit(1)
  }

  const images = await gatherImages(root)
  if (images.length === 0) {
    console.error("Nenhuma imagem .jpg/.jpeg/.png encontrada em", root)
    process.exit(1)
  }

  // Cria diretório de saída se necessário
  await fs.mkdir(path.dirname(out), { recursive: true })

  const stream = fssync.createWriteStream(out)
  const doc = new PDFDocument({
    autoFirstPage: false,
    pdfVersion: "1.7",
    compress: true,
  })
  doc.pipe(stream)

  // Página de capa
  doc.addPage({ size: "A4", layout: "portrait" })
  const margin = 40
  doc.font("Helvetica-Bold").fontSize(24)
  doc.text("Website Image", margin, 200, {
    width: doc.page.width - margin * 2,
    align: "center",
  })
  doc.moveDown()
  doc.font("Helvetica").fontSize(12)
  doc.text(`Generated in: ${new Date().toLocaleString()}`, {
    width: doc.page.width - margin * 2,
    align: "center",
  })

  // Páginas de imagens
  for (const img of images) {
    const landscape = img.width / img.height > 1.2
    addImagePage(doc, img, landscape ? "landscape" : "portrait")
  }

  doc.end()

  await new Promise<void>((res, rej) => {
    stream.on("finish", () => res())
    stream.on("error", rej)
  })

  console.log("PDF geberated in:", out)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
