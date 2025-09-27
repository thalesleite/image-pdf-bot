import fg from "fast-glob"
import fs from "node:fs/promises"
import path from "node:path"
import { imageSize } from "image-size"
import { SUPPORTED_EXTS } from "../constants.js"
import { firstFolderAfter, sortByProjectAndPath } from "../utils/project.js"
import type { ImageMeta } from "../types.js"

export async function scanImages(rootDir: string): Promise<ImageMeta[]> {
  const patterns = ["**/*.jpg", "**/*.jpeg", "**/*.png"]
  const entries = await fg(patterns, {
    cwd: rootDir,
    onlyFiles: true,
    dot: false,
    followSymbolicLinks: true,
  })

  const images: ImageMeta[] = []
  for (const rel of entries) {
    const abs = path.join(rootDir, rel)
    const ext = path.extname(rel).toLowerCase()
    if (!SUPPORTED_EXTS.has(ext)) continue

    const bytes = await fs.readFile(abs)
    const dims = imageSize(bytes)
    if (!dims?.width || !dims?.height) continue

    images.push({
      absPath: abs,
      relPath: rel,
      project: firstFolderAfter(rootDir, abs),
      width: dims.width,
      height: dims.height,
      ext,
    })
  }

  return sortByProjectAndPath(images)
}
