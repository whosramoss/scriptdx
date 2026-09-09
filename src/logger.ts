import { ansi, styles, type LoggerColor } from "./colors.js";
import { getOutputStream, type OutputOptions } from "./output.js";

export type { OutputOptions } from "./output.js";

/**
 * Write a colored line to a stream with a prefix icon and optional message.
 *
 * @param color - ANSI style key from the `styles` object
 * @param prefix - Left-side label (typically an icon like ✔ or ✖)
 * @param message - Optional trailing text
 * @param options - Optional `stream` (default `process.stdout`)
 *
 * @example
 * ```ts
 * logColor("lightGreen", "✔", "Build complete");
 * logColor("lightGreen", "✔", "Build complete", { stream: customStream });
 * ```
 */
export function logColor(
  color: LoggerColor,
  prefix: string,
  message = "",
  options?: OutputOptions,
): void {
  if (!(color in styles)) {
    throw new TypeError(`Unknown logger color: ${String(color)}`);
  }
  const stream = getOutputStream(options);
  const code = styles[color];
  stream.write(` ${ansi(code, prefix)} ${message}\n`);
}

/**
 * Log a success message with a green ✔ icon.
 *
 * @param message - Text to display after the icon
 * @param options - Optional `stream` (default `process.stdout`)
 *
 * @example
 * ```ts
 * logSuccess("Build complete");
 * ```
 */
export function logSuccess(message: string, options?: OutputOptions): void {
  logColor("lightGreen", "✔ ", message, options);
}

/**
 * Log an info message with a cyan i icon.
 *
 * @param message - Text to display after the icon
 * @param options - Optional `stream` (default `process.stdout`)
 *
 * @example
 * ```ts
 * logInfo("Using Node 20");
 * ```
 */
export function logInfo(message: string, options?: OutputOptions): void {
  logColor("lightCyan", " i", message, options);
}

/**
 * Log a warning message with a yellow ⚠ icon.
 *
 * @param message - Text to display after the icon
 * @param options - Optional `stream` (default `process.stdout`)
 *
 * @example
 * ```ts
 * logWarning("Deprecated flag ignored");
 * ```
 */
export function logWarning(message: string, options?: OutputOptions): void {
  logColor("lightYellow", "⚠ ", message, options);
}

/**
 * Log an error message with a red ✖ icon.
 *
 * @param message - Text to display after the icon
 * @param options - Optional `stream` (default `process.stdout`)
 *
 * @example
 * ```ts
 * logError("Deploy failed");
 * ```
 */
export function logError(message: string, options?: OutputOptions): void {
  logColor("lightRed", "✖ ", message, options);
}

/**
 * Log a prompt-style question with a green ? icon.
 *
 * @param message - Text to display after the icon
 * @param options - Optional `stream` (default `process.stdout`)
 *
 * @example
 * ```ts
 * logQuestion("Continue?");
 * ```
 */
export function logQuestion(message: string, options?: OutputOptions): void {
  logColor("lightGreen", " ?", message, options);
}

/**
 * Print a section header with a green divider, bright title, and optional subtitle.
 *
 * @param title - Section title (rendered in bright white)
 * @param subtitle - Optional line printed under the title
 * @param options - Optional `stream` (default `process.stdout`)
 *
 * @example
 * ```ts
 * logSection("Deploy", "Production environment");
 * ```
 */
export function logSection(
  title: string,
  subtitle?: string,
  options?: OutputOptions,
): void {
  const stream = getOutputStream(options);
  logColor(
    "lightGreen",
    "-------------------------------------------------------",
    "",
    options,
  );
  stream.write(` ${ansi(styles.brightWhite, title)}\n`);
  if (subtitle) {
    stream.write(` ${subtitle}\n`);
  }
}

/**
 * Print a topic line with a ➤ prefix and surrounding blank lines.
 *
 * @param topic - Topic label to highlight
 * @param options - Optional `stream` (default `process.stdout`)
 *
 * @example
 * ```ts
 * logTopic("Database migrations");
 * ```
 */
export function logTopic(topic: string, options?: OutputOptions): void {
  const stream = getOutputStream(options);
  stream.write("\n");
  stream.write(`${ansi(styles.brightWhite, `➤  ${topic}`)} \n`);
  stream.write("\n");
}

/**
 * @category LOGGER
 * @description Backward-compatible logger aliases.
 */

/**
 * Alias for {@link logSuccess}.
 *
 * @param message - Text to display after the icon
 * @param options - Optional `stream` (default `process.stdout`)
 *
 * @example
 * ```ts
 * success("Done");
 * ```
 */
export function success(message: string, options?: OutputOptions): void {
  logSuccess(message, options);
}

/**
 * Alias for {@link logError}.
 *
 * @param message - Text to display after the icon
 * @param options - Optional `stream` (default `process.stdout`)
 *
 * @example
 * ```ts
 * error("Something went wrong");
 * ```
 */
export function error(message: string, options?: OutputOptions): void {
  logError(message, options);
}

/**
 * Alias for {@link logWarning}.
 *
 * @param message - Text to display after the icon
 * @param options - Optional `stream` (default `process.stdout`)
 *
 * @example
 * ```ts
 * warning("Slow response");
 * ```
 */
export function warning(message: string, options?: OutputOptions): void {
  logWarning(message, options);
}

/**
 * Alias for {@link logInfo}.
 *
 * @param message - Text to display after the icon
 * @param options - Optional `stream` (default `process.stdout`)
 *
 * @example
 * ```ts
 * info("Cache warmed");
 * ```
 */
export function info(message: string, options?: OutputOptions): void {
  logInfo(message, options);
}

/**
 * Log a debug-style message with a purple ● icon.
 *
 * @param message - Text to display after the icon
 * @param options - Optional `stream` (default `process.stdout`)
 *
 * @example
 * ```ts
 * debug("retry count = 3");
 * ```
 */
export function debug(message: string, options?: OutputOptions): void {
  logColor("lightPurple", " ●", message, options);
}
