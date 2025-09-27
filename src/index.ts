import { scanImages } from "./services/imageScanner.js"
import { generatePdf } from "./services/pdfWriter.js"
import type { GenerateOptions } from "./types.js"

export async function buildCatalog(opts: GenerateOptions) {
  const images = await scanImages(opts.rootDir)
  await generatePdf(opts, images)
}
