import { DEFAULTS } from "./constants.js"
import { toAbsolute } from "./utils/fs.js"
import type { GenerateOptions } from "./types.js"

export function normalizeOptions(
  input: GenerateOptions
): Required<GenerateOptions> {
  return {
    rootDir: toAbsolute(input.rootDir),
    outFile: toAbsolute(input.outFile),
    pageSize: input.pageSize ?? DEFAULTS.pageSize,
    margin: input.margin ?? DEFAULTS.margin,
    headerBox: input.headerBox ?? DEFAULTS.headerBox,
    title: input.title ?? DEFAULTS.title,
    locale: input.locale ?? DEFAULTS.locale,
  }
}
