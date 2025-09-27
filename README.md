# image-pdf-bot

Ferramenta CLI para gerar um PDF com todas as imagens de uma pasta (e subpastas), com uma imagem por página e cabeçalho com Projeto — arquivo.

## Instalação/uso local

```bash
npm i
npm run dev -- --root ./imagens --out ./catalogo.pdf
# ou
npm run build && node dist/cli.js --root ./imagens --out ./catalogo.pdf
```
