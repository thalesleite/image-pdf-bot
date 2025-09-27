import fs from "node:fs/promises"
import path from "node:path"

export async function exists(p: string) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

export async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

export function toAbsolute(p: string) {
  return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p)
}
