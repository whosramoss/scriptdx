/**
 * @category TABLE
 * @description Build text tables.
 */

/** One row of cell values for {@link showTable} / {@link showTableWithBorders}. */
export type TableRow = string[];

function pad(value: string, width: number): string {
  return value.padEnd(width, " ");
}

/**
 * Build an aligned text table with fixed-width columns (24 chars each).
 * Returns a multi-line string; does not print.
 *
 * @param header - Column headers
 * @param rows - Data rows (short rows are padded with empty cells)
 * @returns Multi-line table string, or `""` if `header` is empty
 *
 * @example
 * ```ts
 * console.log(
 *   showTable(["Name", "Status"], [
 *     ["api", "ok"],
 *     ["db", "down"],
 *   ]),
 * );
 * ```
 */
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

/**
 * Build a box-drawn text table with dynamic column widths.
 * Returns a multi-line string; does not print.
 *
 * @param header - Column headers
 * @param rows - Data rows
 * @returns Multi-line bordered table string
 *
 * @example
 * ```ts
 * console.log(
 *   showTableWithBorders(["Name", "Status"], [
 *     ["api", "ok"],
 *     ["db", "down"],
 *   ]),
 * );
 * ```
 */
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
