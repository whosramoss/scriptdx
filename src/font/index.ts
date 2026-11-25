import { stripAnsi } from "../ansi-utils.js";
import { ansi, styles, type LoggerColor } from "../colors.js";
import { BANNER_HEIGHT, getBannerGlyph } from "./banner.js";
import { FONT_HEIGHT, getFontMap } from "./glyphs.js";

/** Fonts accepted by {@link showScriptTitle}. */
export type FontName = "standard" | "banner" | "slant";

/** Rendering options for {@link showScriptTitle}. */
export type TitleOptions = {
  /** Glyph set. Default `"standard"`. */
  font?: FontName;
  /** Text color. */
  color?: LoggerColor;
  /** Horizontal alignment of the art. Default `"left"`. */
  align?: "left" | "center" | "right";
  /** Draw a border around the art. */
  border?: boolean;
  /** Border glyph set when `border` is true. */
  borderStyle?: "single" | "double" | "round";
  /** Spaces between the art and the border. Default `1`. */
  padding?: number;
  /** Cut each line to this many characters. */
  maxWidth?: number;
};

const BORDER_CHARS = {
  single: { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
  double: { tl: "╔", tr: "╗", bl: "╚", br: "╝", h: "═", v: "║" },
  round: { tl: "╭", tr: "╮", bl: "╰", br: "╯", h: "─", v: "│" },
} as const;

/**
 * Font names accepted by {@link showScriptTitle}.
 *
 * @returns `["standard", "banner", "slant"]`
 */
export function getAvailableFonts(): FontName[] {
  return ["standard", "banner", "slant"];
}

function renderStandard(text: string): string[] {
  const fontMap = getFontMap();
  const lines: string[] = Array.from({ length: FONT_HEIGHT }, () => "");
  for (let row = 0; row < FONT_HEIGHT; row += 1) {
    let line = "";
    for (const letter of text) {
      const glyph = fontMap[letter] ?? [letter];
      line += `${glyph[row] ?? " "} `;
    }
    lines[row] = line.trimEnd();
  }
  return lines;
}

function renderBanner(text: string): string[] {
  const lines: string[] = Array.from({ length: BANNER_HEIGHT }, () => "");
  for (let row = 0; row < BANNER_HEIGHT; row += 1) {
    let line = "";
    for (const letter of text) {
      line += `${getBannerGlyph(letter)[row] ?? "    "} `;
    }
    lines[row] = line.trimEnd();
  }
  return lines;
}

function renderSlant(text: string): string[] {
  return renderBanner(text).map((line, index) => `${" ".repeat(BANNER_HEIGHT - 1 - index)}${line}`);
}

function alignLines(lines: string[], align: TitleOptions["align"]): string[] {
  if (!align || align === "left" || lines.length === 0) return lines;
  const maxLineWidth = Math.max(...lines.map((line) => line.length));
  return lines.map((line) => {
    const pad = maxLineWidth - line.length;
    const left = align === "center" ? Math.floor(pad / 2) : pad;
    return `${" ".repeat(left)}${line}`;
  });
}

function addBorder(
  lines: string[],
  style: "single" | "double" | "round",
  padding: number,
  color?: LoggerColor,
): string[] {
  const chars = BORDER_CHARS[style];
  const maxWidth = Math.max(0, ...lines.map((line) => stripAnsi(line).length));
  const innerWidth = maxWidth + padding * 2;
  const paddingStr = " ".repeat(Math.max(0, padding));
  const colorize = (value: string): string => (color ? ansi(styles[color], value) : value);
  const blank = colorize(chars.v) + " ".repeat(innerWidth) + colorize(chars.v);
  const result = [colorize(chars.tl + chars.h.repeat(innerWidth) + chars.tr)];

  for (let index = 0; index < padding; index += 1) result.push(blank);
  for (const line of lines) {
    const extra = " ".repeat(maxWidth - stripAnsi(line).length);
    result.push(colorize(chars.v) + paddingStr + line + extra + paddingStr + colorize(chars.v));
  }
  for (let index = 0; index < padding; index += 1) result.push(blank);
  result.push(colorize(chars.bl + chars.h.repeat(innerWidth) + chars.br));
  return result;
}

/**
 * Render text as ASCII art.
 * The standard glyph map is allocated on the first call that uses it.
 *
 * @param text - Text to render
 * @param options - Font, color, alignment, border, and max width
 * @returns Multi-line string
 *
 * @example
 * ```ts
 * import { showScriptTitle } from "scriptdx/font";
 * console.log(showScriptTitle("Hi", { font: "banner", color: "lightCyan" }));
 * ```
 */
export function showScriptTitle(text: string, options: TitleOptions = {}): string {
  const { font = "standard", color, align = "left", border = false, borderStyle = "single", padding = 1, maxWidth } =
    options;

  let lines =
    font === "banner" ? renderBanner(text) : font === "slant" ? renderSlant(text) : renderStandard(text);
  if (maxWidth !== undefined && maxWidth >= 0) {
    lines = lines.map((line) => line.slice(0, maxWidth));
  }
  lines = alignLines(lines, align);
  if (color) lines = lines.map((line) => ansi(styles[color], line));
  if (border) lines = addBorder(lines, borderStyle, padding, color);
  return lines.join("\n");
}

/**
 * Print {@link showScriptTitle} to stdout.
 *
 * @param text - Text to render
 * @param options - Title options
 */
export function printTitle(text: string, options: TitleOptions = {}): void {
  console.log(showScriptTitle(text, options));
}
