const ESC = "\x1b[";
const RESET = `${ESC}0m`;

function shouldUseColor(): boolean {
  if ("NO_COLOR" in process.env) return false;
  if ("FORCE_COLOR" in process.env) return true;
  return process.stdout.isTTY === true;
}

let colorEnabled: boolean | undefined;

/**
 * Whether ANSI colors are currently applied.
 *
 * Detection (cached until {@link setColorEnabled} is called):
 * `NO_COLOR` disables, `FORCE_COLOR` forces on, otherwise `stdout.isTTY`.
 */
export function isColorEnabled(): boolean {
  if (colorEnabled === undefined) {
    colorEnabled = shouldUseColor();
  }
  return colorEnabled;
}

/**
 * Override automatic color detection.
 *
 * @param enabled - `true` to always emit ANSI, `false` to never emit it
 *
 * @example
 * ```ts
 * import { setColorEnabled, isColorEnabled } from "scriptdx";
 * setColorEnabled(false);
 * console.log(isColorEnabled()); // false
 * ```
 */
export function setColorEnabled(enabled: boolean): void {
  colorEnabled = enabled;
}

/**
 * Wrap `text` with an ANSI SGR sequence and reset.
 * Returns `text` unchanged when color is disabled.
 *
 * @param code - SGR parameter string (e.g. `"1;32"` for bright green)
 * @param text - Text to colorize
 * @returns Colored string with trailing reset, or plain `text`
 */
export function ansi(code: string, text: string): string {
  if (!isColorEnabled()) return text;
  return `${ESC}${code}m${text}${RESET}`;
}

/**
 * Named ANSI SGR codes used by logger helpers and `logColor`.
 *
 * Keys include base colors, light variants, `brightWhite`, and `reset`.
 *
 * @example
 * ```ts
 * import { styles } from "scriptdx";
 * // Prefer `color.*` or `logColor` in app code; `styles` is for low-level use.
 * console.log(styles.lightGreen);
 * ```
 */
export const styles = {
  reset: RESET,
  black: "0;30",
  red: "0;31",
  green: "0;32",
  yellow: "0;33",
  blue: "0;34",
  purple: "0;35",
  cyan: "0;36",
  white: "0;37",
  darkGray: "1;30",
  lightRed: "1;31",
  lightGreen: "1;32",
  lightYellow: "1;33",
  lightBlue: "1;34",
  lightPurple: "1;35",
  lightCyan: "1;36",
  brightWhite: "1;37",
} as const;

/** Valid color key accepted by `logColor` and related helpers. */
export type LoggerColor = keyof typeof styles;

/** ANSI SGR codes for text styling. */
export const modifiers = {
  bold: "1",
  dim: "2",
  italic: "3",
  underline: "4",
  blink: "5",
  inverse: "7",
  hidden: "8",
  strikethrough: "9",
} as const;

/** Style name accepted by a {@link ColorChain}. */
export type Modifier = keyof typeof modifiers;

type ColorFn = (text: string) => string;

const chainModifiers = [
  "bold",
  "dim",
  "italic",
  "underline",
  "strikethrough",
  "inverse",
] as const satisfies readonly Modifier[];

/**
 * Callable color function with lazy style modifiers.
 * Each modifier returns another chain, so styles combine in call order.
 *
 * @example
 * ```ts
 * color.red("error");
 * color.red.bold("error");
 * color.red.bold.underline("error");
 * color.cyan.italic.dim("subtle");
 * ```
 */
export type ColorChain = ColorFn & {
  readonly bold: ColorChain;
  readonly dim: ColorChain;
  readonly italic: ColorChain;
  readonly underline: ColorChain;
  readonly strikethrough: ColorChain;
  readonly inverse: ColorChain;
};

function buildColorFn(colorCode: number, activeModifiers: readonly string[]): ColorChain {
  const apply: ColorFn = (text: string): string => {
    const codes = [...activeModifiers, String(colorCode)].join(";");
    return ansi(codes, text);
  };
  const chain = apply as ColorChain;

  for (const name of chainModifiers) {
    Object.defineProperty(chain, name, {
      enumerable: true,
      get(): ColorChain {
        return buildColorFn(colorCode, [...activeModifiers, modifiers[name]]);
      },
    });
  }

  return chain;
}

function makeColor(code: number): ColorChain {
  return buildColorFn(code, []);
}

/**
 * Chainable ANSI color helpers for inline string styling.
 *
 * Each entry is a function `(text) => string` with chainable modifiers
 * (`.bold`, `.dim`, `.italic`, `.underline`, `.strikethrough`, `.inverse`).
 * Sequences are omitted when {@link isColorEnabled} is `false`.
 *
 * @example
 * ```ts
 * console.log(color.cyan("deploy") + " " + color.green.bold("ok"));
 * ```
 */
export const color = {
  black: makeColor(30),
  red: makeColor(31),
  green: makeColor(32),
  yellow: makeColor(33),
  blue: makeColor(34),
  magenta: makeColor(35),
  cyan: makeColor(36),
  white: makeColor(37),
  gray: makeColor(90),
  brightRed: makeColor(91),
  brightGreen: makeColor(92),
  brightYellow: makeColor(93),
  brightBlue: makeColor(94),
  brightMagenta: makeColor(95),
  brightCyan: makeColor(96),
  brightWhite: makeColor(97),
} as const;
