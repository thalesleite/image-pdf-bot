# image-pdf-bot

Ferramenta CLI para gerar um PDF com todas as imagens de uma pasta (e subpastas), com uma imagem por página e cabeçalho com Projeto — arquivo.

## Instalação/uso local

```bash
npm i
npm run dev -- --root ./imagens --out ./catalogo.pdf
# ou
npm run build && node dist/cli.js --root ./imagens --out ./catalogo.pdf


# exemplo: sua pasta raiz de imagens é ./imagens (com subpastas por projeto)
npm run dev -- \
  --root "$HOME/Workspace/clients/CDP - CDP Architecture/CDP Projects" \
  --out  ./out/website_images.pdf
```
