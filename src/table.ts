/**
 * @category TABLE
 * @description Build text tables.
 */

import { padEnd, stringWidth, truncate as truncateStr } from "./ansi-utils.js";

/** One row of cell values for {@link showTable} / {@link showTableWithBorders}. */
export type TableRow = string[];

/** Options for {@link showTable}. */
export type TableOptions = {
  /**
   * Column width in characters, `"auto"`, or one width per column.
   * Default `24` keeps the historical fixed layout.
   */
  columnWidth?: number | "auto" | number[];
  /** Lower bound applied when `columnWidth` is `"auto"` (default `0`). */
  minWidth?: number;
  /** Maximum column width. Content wider than this is truncated or wrapped. */
  maxWidth?: number;
  /** Truncation indicator (default `"…"`). */
  ellipsis?: string;
  /** Wrap long content instead of truncating. */
  wrap?: boolean;
  /** Maximum data rows. Extra rows are summarized as `... and N more rows`. */
  maxRows?: number;
  /** Header casing. Default `"none"`. */
  headerStyle?: "uppercase" | "capitalize" | "none";
};

function columnWidths(header: string[], rows: TableRow[], minWidth = 0): number[] {
  return header.map((h, i) =>
    Math.max(minWidth, h.length, ...rows.map((row) => (row[i] ?? "").length)),
  );
}

function truncateCell(value: string, maxWidth: number, ellipsis: string): string {
  if (stringWidth(value) <= maxWidth) return value;
  return truncateStr(value, maxWidth, ellipsis);
}

function wrapCell(value: string, maxWidth: number): string[] {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (currentLine.length === 0) {
      currentLine = word;
    } else if (stringWidth(currentLine) + 1 + stringWidth(word) <= maxWidth) {
      currentLine += ` ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine.length > 0) lines.push(currentLine);
  return lines.length > 0 ? lines : [""];
}

function styleHeader(header: string, style: TableOptions["headerStyle"]): string {
  switch (style) {
    case "uppercase":
      return header.toUpperCase();
    case "capitalize":
      return header.charAt(0).toUpperCase() + header.slice(1).toLowerCase();
    default:
      return header;
  }
}

function normalizeRows(header: string[], rows: TableRow[]): TableRow[] {
  return rows.map((row) =>
    row.length < header.length
      ? [...row, ...Array.from({ length: header.length - row.length }, () => "")]
      : row,
  );
}

function resolveWidths(
  header: string[],
  rows: TableRow[],
  columnWidth: number | "auto" | number[],
  minWidth: number,
  maxWidth: number | undefined,
): number[] {
  let widths: number[];
  if (Array.isArray(columnWidth)) {
    widths = header.map((_, i) => columnWidth[i] ?? 24);
  } else if (columnWidth === "auto") {
    widths = header.map((h, i) =>
      Math.max(minWidth, stringWidth(h), ...rows.map((row) => stringWidth(row[i] ?? ""))),
    );
  } else {
    widths = header.map(() => columnWidth);
  }

  if (maxWidth) return widths.map((width) => Math.min(width, maxWidth));
  return widths;
}

type Cell = string | string[];

function processCell(
  value: string,
  width: number,
  wrap: boolean,
  maxWidth: number | undefined,
  ellipsis: string,
): Cell {
  if (wrap && stringWidth(value) > width) return wrapCell(value, width);
  if (maxWidth && stringWidth(value) > width) return truncateCell(value, width, ellipsis);
  return value;
}

function renderRow(cells: Cell[], widths: number[]): string[] {
  const wrapped = cells.some((cell) => Array.isArray(cell));
  if (!wrapped) {
    return [
      cells.map((cell, index) => padEnd(typeof cell === "string" ? cell : "", widths[index] ?? 0)).join(" "),
    ];
  }

  const lineCount = Math.max(...cells.map((cell) => (Array.isArray(cell) ? cell.length : 1)));
  const lines: string[] = [];
  for (let lineIndex = 0; lineIndex < lineCount; lineIndex += 1) {
    lines.push(
      cells
        .map((cell, index) => {
          const value = Array.isArray(cell) ? (cell[lineIndex] ?? "") : lineIndex === 0 ? cell : "";
          return padEnd(value, widths[index] ?? 0);
        })
        .join(" "),
    );
  }
  return lines;
}

/**
 * Build an aligned text table.
 * Returns a multi-line string; does not print.
 *
 * @param header - Column headers
 * @param rows - Data rows (short rows are padded with empty cells)
 * @param options - Width, truncation, wrapping, and row limit
 * @returns Multi-line table string, or `""` if `header` is empty
 *
 * @example
 * ```ts
 * showTable(["Name", "Status"], [["api", "ok"]]);
 * showTable(["Name", "Description"], rows, { columnWidth: "auto", maxWidth: 25 });
 * ```
 */
export function showTable(header: string[], rows: TableRow[], options: TableOptions = {}): string {
  if (header.length === 0) return "";

  const {
    columnWidth = 24,
    minWidth = 0,
    maxWidth,
    ellipsis = "…",
    wrap = false,
    maxRows,
    headerStyle = "none",
  } = options;

  const normalizedRows = normalizeRows(header, rows);
  const widths = resolveWidths(header, normalizedRows, columnWidth, minWidth, maxWidth);
  const styledHeader = header.map((cell) => styleHeader(cell, headerStyle));
  const headerLine = styledHeader
    .map((cell, index) => padEnd(truncateCell(cell, widths[index] ?? 0, ellipsis), widths[index] ?? 0))
    .join(" ");
  const divider = widths.map((width) => "-".repeat(width)).join(" ");

  let displayRows = normalizedRows;
  let moreCount = 0;
  if (maxRows && normalizedRows.length > maxRows) {
    displayRows = normalizedRows.slice(0, maxRows);
    moreCount = normalizedRows.length - maxRows;
  }

  const lines = displayRows.flatMap((row) =>
    renderRow(
      row.map((cell, index) => processCell(cell, widths[index] ?? 0, wrap, maxWidth, ellipsis)),
      widths,
    ),
  );

  const result = [headerLine, divider, ...lines];
  if (moreCount > 0) result.push(`... and ${moreCount} more rows`);
  return result.join("\n");
}

/**
 * Helpers for compact, wrapped, and paginated tables.
 *
 * @param defaultOptions - Options merged into every builder method
 */
export function createTableBuilder(defaultOptions: TableOptions = {}) {
  return {
    compact(header: string[], rows: TableRow[]): string {
      return showTable(header, rows, { ...defaultOptions, columnWidth: "auto", maxWidth: 30 });
    },
    full(header: string[], rows: TableRow[]): string {
      return showTable(header, rows, { ...defaultOptions, columnWidth: "auto", wrap: true });
    },
    paginated(header: string[], rows: TableRow[], page: number, pageSize = 10): string {
      const start = page * pageSize;
      const pageRows = rows.slice(start, start + pageSize);
      const totalPages = Math.ceil(rows.length / pageSize);
      const table = showTable(header, pageRows, defaultOptions);
      return `${table}\n\nPage ${page + 1} of ${totalPages} (${rows.length} total rows)`;
    },
  };
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
 * console.log(showTableWithBorders(["Name", "Status"], [["api", "ok"]]));
 * ```
 */
export function showTableWithBorders(header: string[], rows: TableRow[]): string {
  const widths = columnWidths(header, rows);
  const separator = `+${widths.map((width) => "-".repeat(width + 2)).join("+")}+`;
  const buildRow = (row: string[]) =>
    `| ${row.map((cell, index) => (cell ?? "").padEnd(widths[index] ?? 0)).join(" | ")} |`;

  return [separator, buildRow(header), separator, ...rows.map(buildRow), separator].join("\n");
}
