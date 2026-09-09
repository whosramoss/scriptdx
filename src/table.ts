/**
 * @category TABLE
 * @description Build text tables.
 */

/** One row of cell values for {@link showTable} / {@link showTableWithBorders}. */
export type TableRow = string[];

/** Options for {@link showTable}. */
export type TableOptions = {
  /**
   * Column width in characters, or `"auto"` to size each column to its content.
   * Default `24` keeps the historical fixed layout.
   */
  columnWidth?: number | "auto";
  /** Lower bound applied when `columnWidth` is `"auto"` (default `0`). */
  minWidth?: number;
};

function pad(value: string, width: number): string {
  return value.padEnd(width, " ");
}

function columnWidths(
  header: string[],
  rows: TableRow[],
  minWidth = 0,
): number[] {
  return header.map((h, i) =>
    Math.max(minWidth, h.length, ...rows.map((row) => (row[i] ?? "").length)),
  );
}

/**
 * Build an aligned text table.
 * Returns a multi-line string; does not print.
 *
 * @param header - Column headers
 * @param rows - Data rows (short rows are padded with empty cells)
 * @param options - Width mode (`24` by default, or `"auto"`)
 * @returns Multi-line table string, or `""` if `header` is empty
 *
 * @example
 * ```ts
 * showTable(["Name", "Status"], [
 *   ["api", "ok"],
 *   ["db", "down"],
 * ]);
 *
 * showTable(["ID", "Name"], [["1", "Ana"]], { columnWidth: "auto" });
 * ```
 */
export function showTable(
  header: string[],
  rows: TableRow[],
  options: TableOptions = {},
): string {
  if (header.length === 0) return "";

  const mode = options.columnWidth ?? 24;
  const widths =
    mode === "auto"
      ? columnWidths(header, rows, options.minWidth ?? 0)
      : header.map(() => mode);

  const formatRow = (row: string[]): string =>
    header.map((_, i) => pad(row[i] ?? "", widths[i] ?? 0)).join(" ");

  const headerLine = formatRow(header);
  const divider = widths.map((w) => "-".repeat(w)).join(" ");
  const lines = rows.map(formatRow);
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
  const widths = columnWidths(header, rows);

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
