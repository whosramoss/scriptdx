// -------------------------------------------------------
// Category    :: LOGGER
// Description :: Log text with ANSI colors.
// -------------------------------------------------------
import { ansi, styles, type LoggerColor } from "./colors.js";

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

export function logSuccess(message: string): void {
  logColor("lightGreen", "✔ ", message);
}

export function logInfo(message: string): void {
  logColor("lightCyan", " i", message);
}

export function logWarning(message: string): void {
  logColor("lightYellow", "⚠ ", message);
}

export function logError(message: string): void {
  logColor("lightRed", "✖ ", message);
}

export function logQuestion(message: string): void {
  logColor("lightGreen", " ?", message);
}

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

export function logTopic(topic: string): void {
  process.stdout.write("\n");
  process.stdout.write(`${ansi(styles.brightWhite, `➤  ${topic}`)} \n`);
  process.stdout.write("\n");
}

// -------------------------------------------------------
// Category    :: LOGGER
// Description :: Backward-compatible logger aliases.
// -------------------------------------------------------
export function success(message: string): void {
  logSuccess(message);
}

export function error(message: string): void {
  logError(message);
}

export function warning(message: string): void {
  logWarning(message);
}

export function info(message: string): void {
  logInfo(message);
}

export function debug(message: string): void {
  logColor("lightPurple", " ●", message);
}
