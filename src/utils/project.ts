import path from "node:path"

export function firstFolderAfter(root: string, file: string) {
  const rel = path.relative(root, path.dirname(file))
  if (!rel || rel === ".") return "root"
  return rel.split(path.sep)[0] ?? "root"
}

export function sortByProjectAndPath<
  T extends { project: string; relPath: string }
>(arr: T[]) {
  arr.sort(
    (a, b) =>
      a.project.localeCompare(b.project, undefined, { numeric: true }) ||
      a.relPath.localeCompare(b.relPath, undefined, { numeric: true })
  )
  return arr
}
