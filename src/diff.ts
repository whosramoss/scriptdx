/**
 * @category DIFF
 * @description Colored line and inline diffs.
 */

import { ansi, styles } from "./colors.js";
import type { OutputOptions } from "./output.js";
import { getOutputStream } from "./output.js";

/** One line in a computed diff. */
export type DiffLine = {
  type: "add" | "remove" | "same";
  content: string;
  oldLine?: number;
  newLine?: number;
};

/** Line diff plus add/delete counts. */
export type DiffResult = {
  lines: DiffLine[];
  additions: number;
  deletions: number;
  hasChanges: boolean;
};

/** Display options for {@link formatDiff} and {@link showDiff}. */
export type DiffOptions = OutputOptions & {
  /** Context lines around each change (default `3`). */
  context?: number;
  /** Show old/new line numbers (default `true`). */
  lineNumbers?: boolean;
  /** Color for additions (default `lightGreen`). */
  addColor?: keyof typeof styles;
  /** Color for deletions (default `lightRed`). */
  removeColor?: keyof typeof styles;
  /** Color for line numbers (default `darkGray`). */
  lineNumberColor?: keyof typeof styles;
  /** Header style. Default `"unified"`. */
  header?: "unified" | "simple" | "none";
};

function computeLCS(a: string[], b: string[]): string[] {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let i = 1; i < rows; i += 1) {
    const current = dp[i];
    const previous = dp[i - 1];
    if (!current || !previous) continue;
    for (let j = 1; j < cols; j += 1) {
      if (a[i - 1] !== undefined && a[i - 1] === b[j - 1]) {
        current[j] = (previous[j - 1] ?? 0) + 1;
      } else {
        current[j] = Math.max(previous[j] ?? 0, current[j - 1] ?? 0);
      }
    }
  }

  const lcs: string[] = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 && j > 0) {
    const row = dp[i];
    const above = dp[i - 1];
    if (a[i - 1] !== undefined && a[i - 1] === b[j - 1]) {
      lcs.unshift(a[i - 1] ?? "");
      i -= 1;
      j -= 1;
    } else if ((above?.[j] ?? 0) > (row?.[j - 1] ?? 0)) {
      i -= 1;
    } else {
      j -= 1;
    }
  }
  return lcs;
}

function computeDiff(oldLines: string[], newLines: string[]): DiffLine[] {
  const result: DiffLine[] = [];
  const lcs = computeLCS(oldLines, newLines);
  let oldIdx = 0;
  let newIdx = 0;
  let lcsIdx = 0;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    const common = lcs[lcsIdx];
    if (common !== undefined && oldIdx < oldLines.length && oldLines[oldIdx] === common) {
      if (newIdx < newLines.length && newLines[newIdx] === common) {
        result.push({
          type: "same",
          content: oldLines[oldIdx] ?? "",
          oldLine: oldIdx + 1,
          newLine: newIdx + 1,
        });
        oldIdx += 1;
        newIdx += 1;
        lcsIdx += 1;
      } else if (newIdx < newLines.length) {
        result.push({ type: "add", content: newLines[newIdx] ?? "", newLine: newIdx + 1 });
        newIdx += 1;
      } else {
        result.push({ type: "remove", content: oldLines[oldIdx] ?? "", oldLine: oldIdx + 1 });
        oldIdx += 1;
      }
    } else if (common !== undefined && newIdx < newLines.length && newLines[newIdx] === common) {
      result.push({ type: "remove", content: oldLines[oldIdx] ?? "", oldLine: oldIdx + 1 });
      oldIdx += 1;
    } else if (oldIdx < oldLines.length) {
      result.push({ type: "remove", content: oldLines[oldIdx] ?? "", oldLine: oldIdx + 1 });
      oldIdx += 1;
    } else if (newIdx < newLines.length) {
      result.push({ type: "add", content: newLines[newIdx] ?? "", newLine: newIdx + 1 });
      newIdx += 1;
    }
  }

  return result;
}

/**
 * Compute a line diff between two strings.
 *
 * @param oldText - Original text
 * @param newText - Modified text
 * @returns Lines plus addition and deletion counts
 *
 * @example
 * ```ts
 * const result = diff("a\nb", "a\nc");
 * console.log(`+${result.additions} -${result.deletions}`);
 * ```
 */
export function diff(oldText: string, newText: string): DiffResult {
  const lines = computeDiff(oldText.split("\n"), newText.split("\n"));
  const additions = lines.filter((line) => line.type === "add").length;
  const deletions = lines.filter((line) => line.type === "remove").length;
  return { lines, additions, deletions, hasChanges: additions > 0 || deletions > 0 };
}

/**
 * Format a diff result as a colored string.
 *
 * @param result - Result from {@link diff}
 * @param options - Context, colors, and line numbers
 * @returns Colored diff text, or `"No changes"`
 *
 * @example
 * ```ts
 * console.log(formatDiff(diff(before, after)));
 * ```
 */
export function formatDiff(result: DiffResult, options: DiffOptions = {}): string {
  const {
    context = 3,
    lineNumbers = true,
    addColor = "lightGreen",
    removeColor = "lightRed",
    lineNumberColor = "darkGray",
  } = options;

  const changeIndices = result.lines.flatMap((line, index) => (line.type === "same" ? [] : [index]));
  if (changeIndices.length === 0) return "No changes";

  const output: string[] = [];
  let lastPrintedIndex = -1;

  for (const changeIdx of changeIndices) {
    const start = Math.max(0, changeIdx - context);
    const end = Math.min(result.lines.length - 1, changeIdx + context);
    if (lastPrintedIndex >= 0 && start > lastPrintedIndex + 1) {
      output.push(ansi(styles.darkGray, "..."));
    }

    for (let index = Math.max(start, lastPrintedIndex + 1); index <= end; index += 1) {
      const line = result.lines[index];
      if (!line) continue;
      let formatted = "";
      if (lineNumbers) {
        const oldNum = line.oldLine?.toString().padStart(4) ?? "    ";
        const newNum = line.newLine?.toString().padStart(4) ?? "    ";
        formatted += ansi(styles[lineNumberColor], `${oldNum} ${newNum} `);
      }
      if (line.type === "add") formatted += ansi(styles[addColor], `+ ${line.content}`);
      else if (line.type === "remove") formatted += ansi(styles[removeColor], `- ${line.content}`);
      else formatted += `  ${line.content}`;
      output.push(formatted);
      lastPrintedIndex = index;
    }
  }

  return output.join("\n");
}

/**
 * Write a colored diff to a stream.
 *
 * @param oldText - Original text
 * @param newText - Modified text
 * @param options - Header, colors, and `stream` (default `process.stdout`)
 *
 * @example
 * ```ts
 * showDiff(before, after);
 * ```
 */
export function showDiff(oldText: string, newText: string, options: DiffOptions = {}): void {
  const stream = getOutputStream(options);
  const result = diff(oldText, newText);
  const header = options.header ?? "unified";

  if (header === "unified") {
    stream.write(`${ansi(styles.brightWhite, "--- old\n+++ new\n")}`);
    stream.write(ansi(styles.darkGray, `@@ +${result.additions} -${result.deletions} @@\n`));
  } else if (header === "simple") {
    stream.write(
      ansi(styles.darkGray, `${result.additions} additions, ${result.deletions} deletions\n`),
    );
  }

  stream.write(formatDiff(result, options));
  stream.write("\n");
}

/**
 * Highlight the changed middle of two single lines.
 *
 * @param oldLine - Original line
 * @param newLine - Modified line
 * @returns Colored line with the previous middle in parentheses
 *
 * @example
 * ```ts
 * inlineDiff("hello world", "hello there");
 * ```
 */
export function inlineDiff(oldLine: string, newLine: string): string {
  if (oldLine === newLine) return oldLine;

  let prefixLen = 0;
  while (
    prefixLen < oldLine.length &&
    prefixLen < newLine.length &&
    oldLine[prefixLen] === newLine[prefixLen]
  ) {
    prefixLen += 1;
  }

  let oldSuffixStart = oldLine.length;
  let newSuffixStart = newLine.length;
  while (
    oldSuffixStart > prefixLen &&
    newSuffixStart > prefixLen &&
    oldLine[oldSuffixStart - 1] === newLine[newSuffixStart - 1]
  ) {
    oldSuffixStart -= 1;
    newSuffixStart -= 1;
  }

  const prefix = oldLine.slice(0, prefixLen);
  const oldMiddle = oldLine.slice(prefixLen, oldSuffixStart);
  const newMiddle = newLine.slice(prefixLen, newSuffixStart);
  const suffix = oldLine.slice(oldSuffixStart);
  const previous = oldMiddle
    ? ansi(styles.darkGray, ` (was: ${ansi(styles.lightRed, oldMiddle)})`)
    : "";
  return prefix + ansi(styles.lightGreen, newMiddle) + suffix + previous;
}
