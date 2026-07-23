// Convert a Univer workbook snapshot back into an ExcelJS workbook so the user
// can download the sheet as a real .xlsx — preserving values, fills, fonts,
// borders, alignment, number formats, merged cells, column widths & row heights.
/* eslint-disable @typescript-eslint/no-explicit-any */

// "#RRGGBB" → "FFRRGGBB" (ExcelJS ARGB)
function toArgb(rgb?: string): string | undefined {
  if (!rgb) return undefined;
  const h = String(rgb).replace(/^#/, "");
  return h.length === 6 ? "FF" + h.toUpperCase() : undefined;
}

const H_ALIGN: Record<number, string> = { 1: "left", 2: "center", 3: "right" };
const V_ALIGN: Record<number, string> = { 1: "top", 2: "middle", 3: "bottom" };
const BORDER: Record<number, string> = {
  1: "thin",
  2: "medium",
  3: "thick",
  4: "dashed",
  5: "dotted",
  6: "double",
};

function applyStyle(cell: any, s: any) {
  if (!s) return;
  const font: any = {};
  if (s.bl) font.bold = true;
  if (s.it) font.italic = true;
  if (s.ul) font.underline = true;
  if (s.st) font.strike = true;
  if (s.fs) font.size = s.fs;
  if (s.ff) font.name = s.ff;
  if (s.cl?.rgb) font.color = { argb: toArgb(s.cl.rgb) };
  if (Object.keys(font).length) cell.font = font;
  if (s.bg?.rgb) {
    const argb = toArgb(s.bg.rgb);
    if (argb)
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb } };
  }
  const al: any = {};
  if (s.ht && H_ALIGN[s.ht]) al.horizontal = H_ALIGN[s.ht];
  if (s.vt && V_ALIGN[s.vt]) al.vertical = V_ALIGN[s.vt];
  if (s.tb === 3) al.wrapText = true;
  if (Object.keys(al).length) cell.alignment = al;
  if (s.bd) {
    const side = (b: any) =>
      b ? { style: BORDER[b.s] || "thin", color: { argb: toArgb(b.cl?.rgb) || "FF000000" } } : undefined;
    const border: any = {};
    if (s.bd.t) border.top = side(s.bd.t);
    if (s.bd.b) border.bottom = side(s.bd.b);
    if (s.bd.l) border.left = side(s.bd.l);
    if (s.bd.r) border.right = side(s.bd.r);
    if (Object.keys(border).length) cell.border = border;
  }
  if (s.n?.pattern) cell.numFmt = s.n.pattern;
}

// colIndex → Excel column number is 1-based (Univer is 0-based)
export async function univerSnapshotToExcel(
  snap: any,
  ExcelJS: any
): Promise<any> {
  const wb = new ExcelJS.Workbook();
  const styles = snap?.styles || {};
  const order: string[] = Array.isArray(snap?.sheetOrder)
    ? snap.sheetOrder
    : Object.keys(snap?.sheets || {});
  for (const sid of order) {
    const sheet = snap.sheets?.[sid];
    if (!sheet) continue;
    const ws = wb.addWorksheet((sheet.name || "Sheet").slice(0, 31));
    if (sheet.tabColor) {
      const argb = toArgb(sheet.tabColor);
      if (argb) ws.properties.tabColor = { argb };
    }
    // cells
    const cd = sheet.cellData || {};
    for (const r of Object.keys(cd)) {
      const row = cd[r];
      for (const c of Object.keys(row)) {
        const cell = row[c];
        if (!cell) continue;
        const xc = ws.getCell(Number(r) + 1, Number(c) + 1);
        if (cell.f) {
          // Formula cell → write the formula (Excel stores it without the "=")
          // plus the cached result so it displays before a recalc.
          xc.value = {
            formula: String(cell.f).replace(/^=/, ""),
            result: cell.v != null ? cell.v : undefined,
          };
        } else if (cell.v != null) {
          xc.value = cell.v;
        }
        const st = typeof cell.s === "string" ? styles[cell.s] : cell.s;
        applyStyle(xc, st);
      }
    }
    // merges
    for (const m of sheet.mergeData || []) {
      try {
        ws.mergeCells(
          m.startRow + 1,
          m.startColumn + 1,
          m.endRow + 1,
          m.endColumn + 1
        );
      } catch {}
    }
    // column widths
    const colData = sheet.columnData || {};
    for (const c of Object.keys(colData)) {
      const w = colData[c]?.w;
      if (w) ws.getColumn(Number(c) + 1).width = Math.max(4, w / 7);
    }
    // row heights
    const rowData = sheet.rowData || {};
    for (const r of Object.keys(rowData)) {
      const h = rowData[r]?.h;
      if (h) ws.getRow(Number(r) + 1).height = h;
    }
  }
  if (wb.worksheets.length === 0) wb.addWorksheet("Sheet1");
  return wb;
}
