type PdfTextItem = {
  str: string
  transform: number[]
  width: number
}

type PdfPage = {
  getTextContent: () => Promise<{ items: unknown[] }>
  cleanup: () => void
}

type PdfDocument = {
  numPages: number
  getPage: (pageNumber: number) => Promise<PdfPage>
  destroy: () => Promise<void>
}

type PdfjsModule = {
  getDocument: (src: { data: Uint8Array }) => { promise: Promise<PdfDocument> }
}

function isTextItem(item: unknown): item is PdfTextItem {
  if (typeof item !== 'object' || item === null) return false
  if (!('str' in item) || typeof item.str !== 'string') return false
  if (!('width' in item) || typeof item.width !== 'number') return false
  if (!('transform' in item) || !Array.isArray(item.transform)) return false
  return item.transform.length >= 6
}

function linesFromItems(items: PdfTextItem[]): string {
  const glyphs = items.filter((item) => item.str !== '')
  if (glyphs.length === 0) return ''

  const sorted = [...glyphs].sort(
    (a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4],
  )
  const rows: PdfTextItem[][] = []

  for (const glyph of sorted) {
    const y = glyph.transform[5]
    const row = rows.find((current) => Math.abs(current[0].transform[5] - y) <= 2)
    if (row) row.push(glyph)
    else rows.push([glyph])
  }

  return rows
    .map((row) => {
      row.sort((a, b) => a.transform[4] - b.transform[4])
      let line = ''
      let cursor = row[0].transform[4]
      for (const glyph of row) {
        const gap = glyph.transform[4] - cursor
        if (line && gap > 2) {
          const spaces = Math.max(1, Math.round(gap / 4))
          line += ' '.repeat(Math.min(spaces, 8))
        }
        line += glyph.str
        cursor = glyph.transform[4] + glyph.width
      }
      return line.trimEnd()
    })
    .join('\n')
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfjs = (await import('pdfjs-dist/legacy/build/pdf.mjs')) as PdfjsModule
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise

  const pages: string[] = []
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const text = linesFromItems(content.items.filter(isTextItem))
    if (text) pages.push(text)
    page.cleanup()
  }

  await pdf.destroy()

  const text = pages.join('\n\n').trim()
  if (!text) throw new Error('В PDF нет текстового слоя')
  return text
}