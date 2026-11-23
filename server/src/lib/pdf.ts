/** Минимальный генератор одностраничного PDF (Helvetica, текстовые строки). Без зависимостей. */

function esc(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

export function buildInvoicePdf(options: { title: string; lines: string[] }): Buffer {
  const contentLines: string[] = []
  contentLines.push('BT /F1 20 Tf 50 780 Td (' + esc(options.title) + ') Tj ET')
  contentLines.push('BT /F1 10 Tf 50 740 Td 16 TL (' + esc('Playwright Practice Shop') + ') Tj T*')
  for (const line of options.lines) {
    contentLines.push('(' + esc(line) + ') Tj T*')
  }
  contentLines.push('(Счёт сформирован автоматически, подпись не требуется.) Tj')
  contentLines.push('ET')
  const stream = contentLines.join('\n')

  const objects: string[] = []
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>'
  objects[3] =
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>'
  objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  objects[5] = `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = [0]
  for (let i = 1; i <= 5; i++) {
    offsets[i] = Buffer.byteLength(pdf)
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`
  }
  const xrefStart = Buffer.byteLength(pdf)
  pdf += 'xref\n0 6\n'
  pdf += '0000000000 65535 f \n'
  for (let i = 1; i <= 5; i++) {
    pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n'
  }
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`
  return Buffer.from(pdf, 'binary')
}
