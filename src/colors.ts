// -------------------------------------------------------
// Category    :: COLORS
// Description :: ANSI helpers and color chains.
// -------------------------------------------------------
const ESC = "\x1b[";
const RESET = `${ESC}0m`;

export function ansi(code: string, text: string): string {
  return `${ESC}${code}m${text}${RESET}`;
}

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

export type LoggerColor = keyof typeof styles;

function paint(code: number, bold: boolean, text: string): string {
  const value = bold ? `1;${code}` : String(code);
  return ansi(value, text);
}

type ColorFn = (text: string) => string;
export type ColorChain = ColorFn & { readonly bold: ColorFn };

function makeColor(code: number): ColorChain {
  const boldFn: ColorFn = (text: string): string => paint(code, true, text);
  const plain: ColorFn = (text: string): string => paint(code, false, text);
  return Object.assign(plain, { bold: boldFn });
}

export const color = {
  black: makeColor(30),
  red: makeColor(31),
  green: makeColor(32),
  yellow: makeColor(33),
  blue: makeColor(34),
  magenta: makeColor(35),
  cyan: makeColor(36),
  white: makeColor(37),
} as const;
