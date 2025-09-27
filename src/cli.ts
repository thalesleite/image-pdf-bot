#!/usr/bin/env node
import { Command } from "commander"
import { buildCatalog } from "./index.js"
import { exists } from "./utils/fs.js"

const program = new Command()

program
  .name("image-pdf-bot")
  .description("Gera um PDF com 1 imagem por página, organizado por projeto.")
  .requiredOption(
    "--root <dir>",
    "Pasta raiz com imagens (subpastas por projeto)."
  )
  .requiredOption("--out <file>", "Arquivo PDF de saída.")
  .option("--title <text>", "Título da capa", "Website Images")
  .option("--margin <px>", "Margem da página (px)", (v) => Number(v), 40)
  .option(
    "--header-box <px>",
    "Altura reservada para o cabeçalho (px)",
    (v) => Number(v),
    36
  )
  .option("--locale <lc>", "Locale para data/hora", "pt-PT")
  .action(async (opts) => {
    const { root, out, title, margin, headerBox, locale } = opts
    if (!(await exists(root))) {
      console.error("Pasta raiz não encontrada:", root)
      process.exit(1)
    }
    try {
      await buildCatalog({
        rootDir: root,
        outFile: out,
        title,
        margin,
        headerBox,
        locale,
      })
      console.log("PDF generated in:", out)
    } catch (err) {
      console.error(
        "Falha ao gerar PDF:",
        err instanceof Error ? err.message : err
      )
      process.exit(1)
    }
  })

program.parseAsync()
