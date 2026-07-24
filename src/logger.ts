import { ansi, styles, type LoggerColor } from "./colors.js";

/**
 * Write a colored line to stdout with a prefix icon and optional message.
 *
 * @param color - ANSI style key from the `styles` object
 * @param prefix - Left-side label (typically an icon like ✔ or ✖)
 * @param message - Optional trailing text
 *
 * @example
 * ```ts
 * logColor("lightGreen", "✔", "Build complete");
 * ```
 */
export function logColor(
  color: LoggerColor,
  prefix: string,
  message = "",
): void {
  if (!(color in styles)) {
    throw new TypeError(`Unknown logger color: ${String(color)}`);
  }
  const code = styles[color];
  process.stdout.write(` ${ansi(code, prefix)} ${message}\n`);
}

/**
 * Log a success message with a green ✔ icon.
 *
 * @param message - Text to display after the icon
 *
 * @example
 * ```ts
 * logSuccess("Build complete");
 * ```
 */
export function logSuccess(message: string): void {
  logColor("lightGreen", "✔ ", message);
}

/**
 * Log an info message with a cyan i icon.
 *
 * @param message - Text to display after the icon
 *
 * @example
 * ```ts
 * logInfo("Using Node 20");
 * ```
 */
export function logInfo(message: string): void {
  logColor("lightCyan", " i", message);
}

/**
 * Log a warning message with a yellow ⚠ icon.
 *
 * @param message - Text to display after the icon
 *
 * @example
 * ```ts
 * logWarning("Deprecated flag ignored");
 * ```
 */
export function logWarning(message: string): void {
  logColor("lightYellow", "⚠ ", message);
}

/**
 * Log an error message with a red ✖ icon.
 *
 * @param message - Text to display after the icon
 *
 * @example
 * ```ts
 * logError("Deploy failed");
 * ```
 */
export function logError(message: string): void {
  logColor("lightRed", "✖ ", message);
}

/**
 * Log a prompt-style question with a green ? icon.
 *
 * @param message - Text to display after the icon
 *
 * @example
 * ```ts
 * logQuestion("Continue?");
 * ```
 */
export function logQuestion(message: string): void {
  logColor("lightGreen", " ?", message);
}

/**
 * Print a section header with a green divider, bright title, and optional subtitle.
 *
 * @param title - Section title (rendered in bright white)
 * @param subtitle - Optional line printed under the title
 *
 * @example
 * ```ts
 * logSection("Deploy", "Production environment");
 * ```
 */
export function logSection(title: string, subtitle?: string): void {
  logColor(
    "lightGreen",
    "-------------------------------------------------------",
    "",
  );
  process.stdout.write(` ${ansi(styles.brightWhite, title)}\n`);
  if (subtitle) {
    process.stdout.write(` ${subtitle}\n`);
  }
}

/**
 * Print a topic line with a ➤ prefix and surrounding blank lines.
 *
 * @param topic - Topic label to highlight
 *
 * @example
 * ```ts
 * logTopic("Database migrations");
 * ```
 */
export function logTopic(topic: string): void {
  process.stdout.write("\n");
  process.stdout.write(`${ansi(styles.brightWhite, `➤  ${topic}`)} \n`);
  process.stdout.write("\n");
}

/**
 * @category LOGGER
 * @description Backward-compatible logger aliases.
 */

/**
 * Alias for {@link logSuccess}.
 *
 * @param message - Text to display after the icon
 *
 * @example
 * ```ts
 * success("Done");
 * ```
 */
export function success(message: string): void {
  logSuccess(message);
}

/**
 * Alias for {@link logError}.
 *
 * @param message - Text to display after the icon
 *
 * @example
 * ```ts
 * error("Something went wrong");
 * ```
 */
export function error(message: string): void {
  logError(message);
}

/**
 * Alias for {@link logWarning}.
 *
 * @param message - Text to display after the icon
 *
 * @example
 * ```ts
 * warning("Slow response");
 * ```
 */
export function warning(message: string): void {
  logWarning(message);
}

/**
 * Alias for {@link logInfo}.
 *
 * @param message - Text to display after the icon
 *
 * @example
 * ```ts
 * info("Cache warmed");
 * ```
 */
export function info(message: string): void {
  logInfo(message);
}

/**
 * Log a debug-style message with a purple ● icon.
 *
 * @param message - Text to display after the icon
 *
 * @example
 * ```ts
 * debug("retry count = 3");
 * ```
 */
export function debug(message: string): void {
  logColor("lightPurple", " ●", message);
}
