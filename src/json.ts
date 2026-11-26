/**
 * @category JSON
 * @description ANSI syntax highlighting for JSON values.
 */

import { ansi, styles, type LoggerColor } from "./colors.js";

/** Colors and limits for {@link highlightJson}. */
export type JsonHighlightOptions = {
  keyColor?: LoggerColor;
  stringColor?: LoggerColor;
  numberColor?: LoggerColor;
  booleanColor?: LoggerColor;
  nullColor?: LoggerColor;
  bracketColor?: LoggerColor;
  /** Spaces per nesting level (default `2`). */
  indent?: number;
  /** Deepest level to expand (default unlimited). */
  maxDepth?: number;
  /** Maximum array items before a summary line. */
  maxArrayItems?: number;
  /** Maximum string length before `"..."`. */
  maxStringLength?: number;
  /** Sort object keys. */
  sortKeys?: boolean;
};

const DEFAULT_OPTIONS: Required<JsonHighlightOptions> = {
  keyColor: "lightCyan",
  stringColor: "lightGreen",
  numberColor: "lightYellow",
  booleanColor: "lightPurple",
  nullColor: "darkGray",
  bracketColor: "white",
  indent: 2,
  maxDepth: Infinity,
  maxArrayItems: Infinity,
  maxStringLength: Infinity,
  sortKeys: false,
};

function paint(text: string, color: LoggerColor): string {
  return ansi(styles[color], text);
}

function highlightString(value: string, options: Required<JsonHighlightOptions>): string {
  const limited =
    options.maxStringLength < Infinity && value.length > options.maxStringLength
      ? `${value.slice(0, options.maxStringLength)}...`
      : value;
  return paint(JSON.stringify(limited), options.stringColor);
}

function highlightValue(
  value: unknown,
  options: Required<JsonHighlightOptions>,
  depth: number,
  indent: string,
): string {
  if (depth > options.maxDepth) return paint("[...]", options.bracketColor);
  if (value === null) return paint("null", options.nullColor);
  if (value === undefined) return paint("undefined", options.nullColor);
  if (typeof value === "boolean") return paint(String(value), options.booleanColor);
  if (typeof value === "number") return paint(String(value), options.numberColor);
  if (typeof value === "string") return highlightString(value, options);

  const nextIndent = indent + " ".repeat(options.indent);

  if (Array.isArray(value)) {
    if (value.length === 0) return paint("[]", options.bracketColor);
    const truncated = options.maxArrayItems < Infinity && value.length > options.maxArrayItems;
    const items = truncated ? value.slice(0, options.maxArrayItems) : value;
    const lines = items.map((item) => nextIndent + highlightValue(item, options, depth + 1, nextIndent));
    if (truncated) {
      lines.push(nextIndent + paint(`... ${value.length - options.maxArrayItems} more items`, options.nullColor));
    }
    return `${paint("[", options.bracketColor)}\n${lines.join(",\n")}\n${indent}${paint("]", options.bracketColor)}`;
  }

  if (typeof value === "object") {
    let entries = Object.entries(value);
    if (options.sortKeys) entries = entries.sort((a, b) => a[0].localeCompare(b[0]));
    if (entries.length === 0) return paint("{}", options.bracketColor);
    const lines = entries.map(
      ([key, child]) =>
        `${nextIndent}${paint(`"${key}"`, options.keyColor)}: ${highlightValue(child, options, depth + 1, nextIndent)}`,
    );
    return `${paint("{", options.bracketColor)}\n${lines.join(",\n")}\n${indent}${paint("}", options.bracketColor)}`;
  }

  return paint("undefined", options.nullColor);
}

/**
 * Colorize a JSON-like value.
 *
 * @param value - Any value. Objects and arrays are walked.
 * @param options - Colors and size limits
 * @returns A multi-line colored string
 *
 * @example
 * ```ts
 * console.log(highlightJson({ name: "Ada", age: 36 }));
 * ```
 */
export function highlightJson(value: unknown, options: JsonHighlightOptions = {}): string {
  return highlightValue(value, { ...DEFAULT_OPTIONS, ...options }, 0, "");
}

/**
 * Print {@link highlightJson} to stdout.
 *
 * @param value - Value to print
 * @param options - Highlight options
 */
export function printJson(value: unknown, options: JsonHighlightOptions = {}): void {
  console.log(highlightJson(value, options));
}

function compactValue(value: unknown, options: Required<JsonHighlightOptions>): string {
  if (value === null) return paint("null", options.nullColor);
  if (value === undefined) return paint("undefined", options.nullColor);
  if (typeof value === "boolean") return paint(String(value), options.booleanColor);
  if (typeof value === "number") return paint(String(value), options.numberColor);
  if (typeof value === "string") return highlightString(value, options);
  if (Array.isArray(value)) {
    return paint("[", options.bracketColor) + value.map((item) => compactValue(item, options)).join(", ") + paint("]", options.bracketColor);
  }
  if (typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, child]) => `${paint(`"${key}"`, options.keyColor)}: ${compactValue(child, options)}`)
      .join(", ");
    return paint("{", options.bracketColor) + entries + paint("}", options.bracketColor);
  }
  return paint("undefined", options.nullColor);
}

/**
 * Colorize a value on one line.
 *
 * @param value - Value to format
 * @param options - Highlight options
 * @returns A single-line colored string
 */
export function compactJson(value: unknown, options: JsonHighlightOptions = {}): string {
  return compactValue(value, { ...DEFAULT_OPTIONS, ...options });
}

/**
 * Parse JSON without throwing.
 *
 * @param jsonString - JSON text
 * @returns The value, or the parser message and position when present
 *
 * @example
 * ```ts
 * const parsed = parseJsonSafe('{"ok":true}');
 * if (parsed.ok) console.log(parsed.value);
 * ```
 */
export function parseJsonSafe(
  jsonString: string,
): { ok: true; value: unknown } | { ok: false; error: string; position?: number } {
  try {
    return { ok: true, value: JSON.parse(jsonString) as unknown };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    const match = /position (\d+)/.exec(message);
    const position = match?.[1] !== undefined ? Number.parseInt(match[1], 10) : undefined;
    return { ok: false, error: message, position };
  }
}
