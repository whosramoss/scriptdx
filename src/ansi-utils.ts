/**
 * ANSI SGR and cursor-movement sequences.
 * A new regex is created per call so `lastIndex` cannot leak between checks.
 */
function ansiRegex(): RegExp {
  return new RegExp(`${String.fromCharCode(0x1b)}\\[[0-9;]*[a-zA-Z]`, "g");
}

/**
 * Remove all ANSI escape sequences from a string.
 *
 * @param str - String potentially containing ANSI codes
 * @returns Plain text without escape sequences
 *
 * @example
 * ```ts
 * const colored = color.red("ERROR");
 * stripAnsi(colored); // "ERROR"
 * ```
 */
export function stripAnsi(str: string): string {
  return str.replace(ansiRegex(), "");
}

/**
 * Check if a string contains ANSI escape sequences.
 *
 * @param str - String to check
 * @returns `true` when `str` contains ANSI codes
 *
 * @example
 * ```ts
 * hasAnsi(color.red("x")); // true
 * hasAnsi("plain"); // false
 * ```
 */
export function hasAnsi(str: string): boolean {
  return ansiRegex().test(str);
}

/**
 * Visible width of a string, excluding ANSI codes.
 * Counts Unicode code points. Emoji ZWJ sequences are not collapsed.
 *
 * @param str - String to measure
 * @returns Number of visible code points
 *
 * @example
 * ```ts
 * stringWidth(color.red("ERROR")); // 5
 * stringWidth("hello"); // 5
 * ```
 */
export function stringWidth(str: string): number {
  return [...stripAnsi(str)].length;
}

/**
 * Pad a string to a target visible width.
 * ANSI codes stay in place and do not count toward `width`.
 *
 * @param str - String to pad
 * @param width - Target visible width
 * @param char - Padding character (default space)
 * @returns Padded string
 *
 * @example
 * ```ts
 * padEnd(color.red("OK"), 10);
 * ```
 */
export function padEnd(str: string, width: number, char = " "): string {
  const visibleWidth = stringWidth(str);
  if (visibleWidth >= width) return str;
  return str + char.repeat(width - visibleWidth);
}

/**
 * Pad a string on the left to a target visible width.
 *
 * @param str - String to pad
 * @param width - Target visible width
 * @param char - Padding character (default space)
 * @returns Padded string
 *
 * @example
 * ```ts
 * padStart(color.red("5"), 3);
 * ```
 */
export function padStart(str: string, width: number, char = " "): string {
  const visibleWidth = stringWidth(str);
  if (visibleWidth >= width) return str;
  return char.repeat(width - visibleWidth) + str;
}

/**
 * Center a string within a target visible width.
 *
 * @param str - String to center
 * @param width - Target visible width
 * @param char - Padding character (default space)
 * @returns Centered string
 *
 * @example
 * ```ts
 * center(color.green("OK"), 10);
 * ```
 */
export function center(str: string, width: number, char = " "): string {
  const visibleWidth = stringWidth(str);
  if (visibleWidth >= width) return str;
  const total = width - visibleWidth;
  const left = Math.floor(total / 2);
  const right = total - left;
  return char.repeat(left) + str + char.repeat(right);
}

/**
 * Truncate a string to a maximum visible width and append an ellipsis.
 * The result is plain text: ANSI codes are removed before the cut.
 *
 * @param str - String to truncate
 * @param maxWidth - Maximum visible width, including the ellipsis
 * @param ellipsis - Truncation indicator (default `"…"`)
 * @returns Truncated plain text
 *
 * @example
 * ```ts
 * truncate(color.red("Hello World"), 8); // "Hello W…"
 * ```
 */
export function truncate(str: string, maxWidth: number, ellipsis = "…"): string {
  const visibleWidth = stringWidth(str);
  if (visibleWidth <= maxWidth) return str;

  const ellipsisWidth = stringWidth(ellipsis);
  if (maxWidth <= ellipsisWidth) return [...ellipsis].slice(0, maxWidth).join("");

  const chars = [...stripAnsi(str)];
  return chars.slice(0, maxWidth - ellipsisWidth).join("") + ellipsis;
}

/**
 * Wrap text to a maximum width, breaking on whitespace when possible.
 * ANSI codes are stripped before wrapping. Width uses UTF-16 code units.
 *
 * @param str - String to wrap
 * @param maxWidth - Maximum line width
 * @returns Array of lines
 *
 * @example
 * ```ts
 * wrapText("Hello World, this is a test", 10);
 * // ["Hello", "World,", "this is a", "test"]
 * ```
 */
export function wrapText(str: string, maxWidth: number): string[] {
  const words = stripAnsi(str).split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (currentLine.length === 0) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= maxWidth) {
      currentLine += ` ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine.length > 0) lines.push(currentLine);
  return lines;
}
