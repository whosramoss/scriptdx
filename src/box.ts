/**
 * @category BOX
 * @description Decorative boxes, banners, and separators.
 */

import { padEnd, stringWidth, wrapText } from "./ansi-utils.js";
import { ansi, styles, type LoggerColor } from "./colors.js";

/** Border glyph set. */
export type BoxStyle = "single" | "double" | "round" | "heavy" | "none";

/** Named color and icon combination. */
export type BoxPreset = "info" | "success" | "warning" | "error" | "default";

type BoxChars = {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
};

const BOX_CHARS: Record<BoxStyle, BoxChars> = {
  single: { topLeft: "┌", topRight: "┐", bottomLeft: "└", bottomRight: "┘", horizontal: "─", vertical: "│" },
  double: { topLeft: "╔", topRight: "╗", bottomLeft: "╚", bottomRight: "╝", horizontal: "═", vertical: "║" },
  round: { topLeft: "╭", topRight: "╮", bottomLeft: "╰", bottomRight: "╯", horizontal: "─", vertical: "│" },
  heavy: { topLeft: "┏", topRight: "┓", bottomLeft: "┗", bottomRight: "┛", horizontal: "━", vertical: "┃" },
  none: { topLeft: " ", topRight: " ", bottomLeft: " ", bottomRight: " ", horizontal: " ", vertical: " " },
};

const BOX_PRESETS: Record<BoxPreset, { color: LoggerColor; icon?: string }> = {
  default: { color: "white" },
  info: { color: "lightCyan", icon: "ℹ" },
  success: { color: "lightGreen", icon: "✔" },
  warning: { color: "lightYellow", icon: "⚠" },
  error: { color: "lightRed", icon: "✖" },
};

/** Options for {@link box}. */
export type BoxOptions = {
  /** Border style (default `"single"`). */
  style?: BoxStyle;
  /** Preset color and icon. */
  preset?: BoxPreset;
  /** Border color. Overrides the preset color. */
  borderColor?: LoggerColor;
  /** Title drawn inside the top border. */
  title?: string;
  /** Title alignment (default `"left"`). */
  titleAlign?: "left" | "center" | "right";
  /** Horizontal padding inside the border (default `1`). */
  padding?: number;
  /** Inner width. `"auto"` fits the text. `"full"` uses the terminal width. */
  width?: number | "auto" | "full";
  /** Text alignment (default `"left"`). */
  textAlign?: "left" | "center" | "right";
  /** Spaces outside the box (default `0`). */
  margin?: number;
  /** Prefix the preset icon (default `true`). */
  showIcon?: boolean;
};

function terminalColumns(): number {
  return process.stdout.columns || 80;
}

function alignLine(line: string, innerWidth: number, textAlign: "left" | "center" | "right"): string {
  const remaining = Math.max(0, innerWidth - stringWidth(line));
  if (textAlign === "center") {
    const left = Math.floor(remaining / 2);
    return `${" ".repeat(left)}${line}${" ".repeat(remaining - left)}`;
  }
  if (textAlign === "right") return `${" ".repeat(remaining)}${line}`;
  return padEnd(line, innerWidth);
}

/**
 * Draw a border around text.
 *
 * @param text - Content. Newlines are preserved.
 * @param options - Border, preset, title, and width
 * @returns Multi-line box
 *
 * @example
 * ```ts
 * console.log(box("Hello World"));
 * console.log(box("Careful", { preset: "warning" }));
 * ```
 */
export function box(text: string, options: BoxOptions = {}): string {
  const {
    style = "single",
    preset,
    title,
    titleAlign = "left",
    padding = 1,
    width = "auto",
    textAlign = "left",
    margin = 0,
    showIcon = true,
  } = options;

  const presetConfig = preset ? BOX_PRESETS[preset] : BOX_PRESETS.default;
  const borderColor = options.borderColor ?? presetConfig.color;
  const chars = BOX_CHARS[style];
  const content = showIcon && presetConfig.icon ? `${presetConfig.icon}  ${text}` : text;
  const sourceLines = content.split("\n");

  let boxWidth: number;
  if (width === "full") {
    boxWidth = Math.max(1, terminalColumns() - margin * 2 - 2);
  } else if (width === "auto") {
    const maxLineWidth = Math.max(0, ...sourceLines.map((line) => stringWidth(line)));
    const titleWidth = title ? stringWidth(title) + 4 : 0;
    boxWidth = Math.max(maxLineWidth, titleWidth) + padding * 2;
  } else {
    boxWidth = width;
  }

  const innerWidth = Math.max(1, boxWidth - padding * 2);
  const wrappedLines = sourceLines.flatMap((line) =>
    stringWidth(line) > innerWidth ? wrapText(line, innerWidth) : [line],
  );

  const marginStr = " ".repeat(Math.max(0, margin));
  const paddingStr = " ".repeat(Math.max(0, padding));
  const paint = (value: string): string => ansi(styles[borderColor], value);

  let topFill = chars.horizontal.repeat(boxWidth);
  if (title) {
    const titleStr = ` ${title} `;
    const titleWidth = stringWidth(titleStr);
    const fitted = titleWidth >= boxWidth ? titleStr.slice(0, boxWidth) : titleStr;
    const fittedWidth = stringWidth(fitted);
    const rawPos =
      titleAlign === "center"
        ? Math.floor((boxWidth - fittedWidth) / 2)
        : titleAlign === "right"
          ? boxWidth - fittedWidth
          : 1;
    const titlePos = Math.max(0, Math.min(rawPos, boxWidth - fittedWidth));
    topFill =
      chars.horizontal.repeat(titlePos) +
      fitted +
      chars.horizontal.repeat(Math.max(0, boxWidth - titlePos - fittedWidth));
  }

  const lines = [
    marginStr + paint(chars.topLeft + topFill + chars.topRight),
    ...wrappedLines.map(
      (line) =>
        marginStr +
        paint(chars.vertical) +
        paddingStr +
        alignLine(line, innerWidth, textAlign) +
        paddingStr +
        paint(chars.vertical),
    ),
    marginStr + paint(chars.bottomLeft + chars.horizontal.repeat(boxWidth) + chars.bottomRight),
  ];
  return lines.join("\n");
}

/**
 * Print {@link box} to stdout.
 *
 * @param text - Content
 * @param options - Box options
 */
export function printBox(text: string, options: BoxOptions = {}): void {
  console.log(box(text, options));
}

/**
 * Draw a full-width centered box.
 *
 * @param text - Banner text
 * @param options - Box options except `width`
 * @returns Multi-line banner
 */
export function banner(text: string, options: Omit<BoxOptions, "width"> = {}): string {
  return box(text, { ...options, width: "full", textAlign: "center" });
}

/**
 * Draw a rounded preset box.
 *
 * @param text - Callout text
 * @param type - Preset name (default `"info"`)
 * @returns Multi-line callout
 */
export function callout(text: string, type: BoxPreset = "info"): string {
  return box(text, { preset: type, style: "round", padding: 1 });
}

/**
 * Draw a horizontal rule.
 *
 * @param options - Character, width, and color
 * @returns A single colored line
 */
export function separator(
  options: { char?: string; width?: number; color?: LoggerColor } = {},
): string {
  const { char = "─", width = terminalColumns(), color = "darkGray" } = options;
  return ansi(styles[color], char.repeat(Math.max(0, width)));
}
