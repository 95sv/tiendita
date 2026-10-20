// CSV pensado para abrirse con doble clic en Excel en español: separador ";",
// decimales con coma y BOM para que respete tildes y eñes.

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value).replace(".", ",") : ""
  }

  let text = String(value)
  // Un texto que empieza con = + - @ Excel lo ejecuta como fórmula
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function csvDate(value?: string | null): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) {
    alert("No hay datos para exportar")
    return
  }

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.map(formatCell).join(";"),
    ...data.map((row) => headers.map((h) => formatCell(row[h])).join(";")),
  ].join("\r\n")

  const BOM = "﻿"
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
