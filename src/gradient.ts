/**
 * @category COLOR
 * @description Multi-stop text gradients.
 */

import { isColorEnabled, type LoggerColor } from "./colors.js";

/** A named color or an RGB triple. */
export type GradientColor = LoggerColor | [number, number, number];

/** Options for {@link gradient}. */
export type GradientOptions = {
  /** `horizontal` colors each character. `vertical` colors each line. */
  direction?: "horizontal" | "vertical";
};

type RGB = [number, number, number];

const COLOR_RGB: Record<LoggerColor, RGB> = {
  black: [0, 0, 0],
  red: [255, 0, 0],
  green: [0, 255, 0],
  yellow: [255, 255, 0],
  blue: [0, 0, 255],
  purple: [128, 0, 128],
  cyan: [0, 255, 255],
  white: [255, 255, 255],
  darkGray: [128, 128, 128],
  lightRed: [255, 100, 100],
  lightGreen: [100, 255, 100],
  lightYellow: [255, 255, 100],
  lightBlue: [100, 100, 255],
  lightPurple: [200, 100, 200],
  lightCyan: [100, 255, 255],
  brightWhite: [255, 255, 255],
  reset: [255, 255, 255],
};

const ESC = String.fromCharCode(0x1b);

/** Named color stops for {@link applyGradient}. */
export const gradientPresets = {
  cool: ["lightCyan", "lightBlue", "lightPurple"],
  warm: ["lightRed", "lightYellow"],
  rainbow: ["red", "yellow", "green", "cyan", "blue", "purple"],
  ocean: ["lightGreen", "lightCyan", "lightBlue"],
  sunset: ["lightYellow", "lightRed", "lightPurple"],
  neon: ["lightPurple", "lightCyan", "lightGreen"],
  mono: ["white", "darkGray"],
  success: ["lightGreen", "lightCyan"],
  error: ["lightRed", "lightYellow"],
} as const satisfies Record<string, readonly GradientColor[]>;

/** Name of a {@link gradientPresets} entry. */
export type GradientPreset = keyof typeof gradientPresets;

function toRGB(color: GradientColor): RGB {
  if (Array.isArray(color)) return color;
  return COLOR_RGB[color];
}

function mix(from: RGB, to: RGB, amount: number): RGB {
  return [
    Math.round(from[0] + (to[0] - from[0]) * amount),
    Math.round(from[1] + (to[1] - from[1]) * amount),
    Math.round(from[2] + (to[2] - from[2]) * amount),
  ];
}

function trueColor(rgb: RGB): string {
  return `${ESC}[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
}

function colorAt(colors: RGB[], progress: number): RGB {
  const first = colors[0] ?? [255, 255, 255];
  if (colors.length <= 1) return first;
  const segments = colors.length - 1;
  const index = Math.min(Math.floor(progress * segments), segments - 1);
  const local = progress * segments - index;
  const from = colors[index] ?? first;
  const to = colors[index + 1] ?? from;
  return mix(from, to, local);
}

function paintChars(text: string, colors: RGB[]): string {
  const chars = [...text];
  if (chars.length === 0) return text;
  if (colors.length === 1) return `${trueColor(colors[0] ?? [255, 255, 255])}${text}${ESC}[0m`;

  const painted = chars.map((char, index) => {
    if (char === "\n" || char === "\r" || char === "\t") return char;
    const progress = index / (chars.length - 1 || 1);
    return `${trueColor(colorAt(colors, progress))}${char}`;
  });
  painted.push(`${ESC}[0m`);
  return painted.join("");
}

/**
 * Paint text with a gradient.
 * Returns `text` unchanged when color is disabled.
 *
 * @param text - Text to colorize
 * @param colors - Two or more stops. A single stop paints the whole string.
 * @param options - Horizontal or vertical direction
 * @returns Colored text with a trailing reset
 *
 * @example
 * ```ts
 * console.log(gradient("Welcome", ["cyan", "blue", "purple"]));
 * ```
 */
export function gradient(text: string, colors: GradientColor[], options: GradientOptions = {}): string {
  if (!isColorEnabled() || colors.length === 0) return text;
  const stops = colors.map(toRGB);
  if (options.direction === "vertical") {
    const lines = text.split("\n");
    return lines
      .map((line, index) => {
        const progress = index / (lines.length - 1 || 1);
        return `${trueColor(colorAt(stops, progress))}${line}`;
      })
      .join("\n") + `${ESC}[0m`;
  }
  return paintChars(text, stops);
}

/**
 * Paint text with a preset gradient.
 *
 * @param text - Text to colorize
 * @param preset - Preset name
 * @returns Colored text
 *
 * @example
 * ```ts
 * applyGradient("Welcome", "rainbow");
 * ```
 */
export function applyGradient(text: string, preset: GradientPreset): string {
  return gradient(text, [...gradientPresets[preset]]);
}

/**
 * Draw a one-line banner with a preset gradient.
 *
 * @param text - Banner text
 * @param preset - Preset name (default `"rainbow"`)
 * @param options - Border and padding
 * @returns A three-line banner, or the colored text when `border` is false
 */
export function gradientBanner(
  text: string,
  preset: GradientPreset = "rainbow",
  options: { border?: boolean; padding?: number } = {},
): string {
  const { border = true, padding = 1 } = options;
  const painted = applyGradient(text, preset);
  if (!border) return painted;
  const width = [...text].length + padding * 2;
  const pad = " ".repeat(Math.max(0, padding));
  const line = "─".repeat(width);
  return [`┌${line}┐`, `│${pad}${painted}${pad}│`, `└${line}┘`].join("\n");
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Shift a gradient across `text` on stdout for `duration` milliseconds.
 *
 * @param text - Text to animate
 * @param colors - Gradient stops
 * @param duration - Total time in ms (default `2000`)
 */
export async function animateGradient(
  text: string,
  colors: GradientColor[] = [...gradientPresets.rainbow],
  duration = 2000,
): Promise<void> {
  const frames = 20;
  const delay = duration / frames;
  const stops = colors.length > 0 ? colors : (["white"] as GradientColor[]);
  for (let frame = 0; frame < frames; frame += 1) {
    const rotated = stops.map((_, index) => stops[(index + frame) % stops.length] ?? "white");
    process.stdout.write(`\r${gradient(text, rotated)}`);
    await wait(delay);
  }
  process.stdout.write("\n");
}
