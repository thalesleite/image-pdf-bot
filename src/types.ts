import type PDFDocument from "pdfkit"

export type PDFDoc = InstanceType<typeof PDFDocument>

export type ImageMeta = {
  absPath: string
  relPath: string
  project: string
  width: number
  height: number
  ext: string
}

export type PageLayout = "portrait" | "landscape"

export type GenerateOptions = {
  rootDir: string // pasta raiz das imagens
  outFile: string // caminho do PDF de saída
  pageSize?: "A4" | "Letter"
  margin?: number // px
  headerBox?: number // px reservados para cabeçalho
  title?: string // título da capa
  locale?: string // ex: 'pt-PT'
}
