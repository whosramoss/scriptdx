// -------------------------------------------------------
// Category    :: TABLE
// Description :: Build text tables.
// -------------------------------------------------------
export type TableRow = string[];

function pad(value: string, width: number): string {
  return value.padEnd(width, " ");
}

export function showTable(header: string[], rows: TableRow[]): string {
  if (header.length === 0) return "";
  const normalizedRows = rows.map((row): TableRow =>
    row.length < header.length
      ? [
          ...row,
          ...Array.from({ length: header.length - row.length }, () => ""),
        ]
      : row,
  );
  const width = 24;
  const headerLine = header.map((h) => pad(h, width)).join(" ");
  const divider = header.map(() => "-".repeat(width)).join(" ");
  const lines = normalizedRows.map((row) =>
    row.map((cell) => pad(cell, width)).join(" "),
  );
  return [headerLine, divider, ...lines].join("\n");
}

export function showTableWithBorders(
  header: string[],
  rows: TableRow[],
): string {
  const widths = header.map((h, i) =>
    Math.max(h.length, ...rows.map((row) => (row[i] ?? "").length)),
  );

  const separator = `+${widths.map((w) => "-".repeat(w + 2)).join("+")}+`;
  const buildRow = (row: string[]) =>
    `| ${row.map((cell, i) => (cell ?? "").padEnd(widths[i] ?? 0)).join(" | ")} |`;

  return [
    separator,
    buildRow(header),
    separator,
    ...rows.map(buildRow),
    separator,
  ].join("\n");
}
