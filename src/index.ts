// -------------------------------------------------------
// Category    :: LOGGER
// Description :: Log text with ANSI colors.
// -------------------------------------------------------
const ESC = "\x1b[";
const RESET = `${ESC}0m`;

function ansi(code: string, text: string): string {
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

export function logColor(
  color: LoggerColor,
  prefix: string,
  message = "",
): void {
  const code = styles[color];
  process.stdout.write(` ${ansi(code, prefix)} ${message}\n`);
}

export function logSuccess(message: string): void {
  logColor("lightGreen", "✔", message);
}

export function logInfo(message: string): void {
  logColor("lightCyan", "i", message);
}

export function logWarning(message: string): void {
  logColor("lightYellow", "⚠", message);
}

export function logError(message: string): void {
  logColor("lightRed", "✖", message);
}

export function logQuestion(message: string): void {
  logColor("lightGreen", "?", message);
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
function paint(code: number, bold: boolean, text: string): string {
  const value = bold ? `1;${code}` : String(code);
  return ansi(value, text);
}

export type ColorChain = ((text: string) => string) & {
  readonly bold: ColorChain;
};

function makeColor(code: number): ColorChain {
  const boldFn = (text: string): string => paint(code, true, text);
  Object.defineProperty(boldFn, "bold", {
    enumerable: true,
    get: (): ColorChain => boldFn as ColorChain,
  });

  const plain = (text: string): string => paint(code, false, text);
  Object.defineProperty(plain, "bold", {
    enumerable: true,
    get: (): ColorChain => boldFn as ColorChain,
  });

  return plain as ColorChain;
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
  logColor("lightPurple", "●", message);
}

// -------------------------------------------------------
// Category    :: SYSTEM
// Description :: Host system helpers.
// -------------------------------------------------------
export function isLinux(): boolean {
  return process.platform === "linux";
}

export function isWindows(): boolean {
  return process.platform === "win32";
}

// -------------------------------------------------------
// Category    :: LOADING
// Description :: Simple loading animations.
// -------------------------------------------------------
// const LOADING_FRAMES = ["|", "/", "-", "\\"] as const;

const LOADING_FRAMES = ["|", "/", "-", "\\"] as const;

export async function simpleLoading(repeat = 2, delayMs = 80): Promise<void> {
  let cycle = 0;
  while (repeat <= 0 || cycle < repeat) {
    for (const frame of LOADING_FRAMES) {
      process.stdout.write(`\r\x1b[K${frame}`);
      await sleep(delayMs);
    }
    cycle += 1;
  }
  process.stdout.write("\n");
}

export async function linearLoading(
  text: string,
  repeat = 2,
  delayMs = 80,
): Promise<void> {
  process.stdout.write("\n");
  const chars = Array.from(text);
  if (chars.length === 0) {
    process.stdout.write("\n");
    return;
  }

  let cycle = 0;
  while (repeat <= 0 || cycle < repeat) {
    for (let offset = 0; offset < chars.length; offset += 1) {
      const frame =
        chars.slice(offset).join("") + chars.slice(0, offset).join("");
      process.stdout.write(`\r\x1b[K${frame}`);
      await sleep(delayMs);
    }
    cycle += 1;
  }
  process.stdout.write("\n");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// -------------------------------------------------------
// Category    :: MENU
// Description :: Run a menu item by index.
// -------------------------------------------------------
export type MenuItem = {
  label: string;
  run: () => void | Promise<void>;
};

export async function runMenuByIndex(
  items: MenuItem[],
  selectedIndex: number,
): Promise<void> {
  const item = items[selectedIndex];
  if (!item) {
    logWarning("Invalid menu index.");
    return;
  }
  process.stdout.write(
    `\n\n${ansi(styles.brightWhite, `Selected: ${item.label}`)}\n\n`,
  );
  await item.run();
}

// -------------------------------------------------------
// Category    :: STEP
// Description :: Run async step with spinner.
// -------------------------------------------------------
const SPINNER_FRAMES = [
  "⠋",
  "⠙",
  "⠹",
  "⠸",
  "⠼",
  "⠴",
  "⠦",
  "⠧",
  "⠇",
  "⠏",
] as const;

export async function runStep(
  task: () => Promise<void>,
  message: string,
): Promise<boolean> {
  let frame = 0;
  const timer = setInterval(() => {
    process.stderr.write(
      `\r${SPINNER_FRAMES[frame % SPINNER_FRAMES.length]} ${message}`,
    );
    frame += 1;
  }, 80);

  try {
    await task();
    clearInterval(timer);
    process.stderr.write("\r\x1b[K");
    logSuccess(message);
    return true;
  } catch {
    clearInterval(timer);
    process.stderr.write("\r\x1b[K");
    logError(message);
    return false;
  }
}

// -------------------------------------------------------
// Category    :: STEP
// Description :: Backward-compatible spinner factory.
// -------------------------------------------------------
export type Spinner = {
  start(text?: string): void;
  stop(finalLine?: string): void;
};

export type SpinnerOptions = {
  intervalMs?: number;
  stream?: NodeJS.WriteStream;
};

export function createSpinner(options: SpinnerOptions = {}): Spinner {
  const intervalMs = options.intervalMs ?? 80;
  const stream = options.stream ?? process.stderr;
  let timer: ReturnType<typeof setInterval> | undefined;
  let frame = 0;
  let label = "";

  const tick = (): void => {
    const f = SPINNER_FRAMES[frame % SPINNER_FRAMES.length] ?? "";
    stream.write(`\r${f} ${label}`);
    frame += 1;
  };

  return {
    start(text = ""): void {
      if (timer !== undefined) {
        return;
      }
      label = text;
      timer = setInterval(tick, intervalMs);
      tick();
    },
    stop(finalLine?: string): void {
      if (timer !== undefined) {
        clearInterval(timer);
        timer = undefined;
      }
      stream.write("\r\x1b[K");
      if (finalLine !== undefined) {
        stream.write(`${finalLine}\n`);
      }
    },
  };
}

// -------------------------------------------------------
// Category    :: TABLE
// Description :: Build text tables.
// -------------------------------------------------------
export type TableRow = string[];

function pad(value: string, width: number): string {
  return value.padEnd(width, " ");
}

export function showTable(header: string[], rows: TableRow[]): string {
  const width = 24;
  const headerLine = header.map((h) => pad(h, width)).join(" ");
  const divider = header.map(() => "-".repeat(width)).join(" ");
  const lines = rows.map((row) =>
    row.map((cell) => pad(cell, width)).join(" "),
  );
  return [headerLine, divider, ...lines].join("\n");
}

export function showTableWithBorders(
  header: string[],
  rows: TableRow[],
): string {
  const widths = header.map((h, i) =>
    Math.max(h.length, ...rows.map((row) => (row[i] ?? "").length)),
  );

  const separator = `+${widths.map((w) => "-".repeat(w + 2)).join("+")}+`;
  const buildRow = (row: string[]) =>
    `| ${row.map((cell, i) => (cell ?? "").padEnd(widths[i] ?? 0)).join(" | ")} |`;

  return [
    separator,
    buildRow(header),
    separator,
    ...rows.map(buildRow),
    separator,
  ].join("\n");
}

// -------------------------------------------------------
// Category    :: VALIDATIONS
// Description :: Tool validation helpers.
// -------------------------------------------------------
export type ToolValidationResult = {
  ok: string[];
  fail: string[];
};

export function hasTool(toolName: string): boolean {
  const pathVar = process.env.PATH ?? "";
  const separator = process.platform === "win32" ? ";" : ":";
  const dirs = pathVar.split(separator).filter(Boolean);
  return dirs.length > 0 && toolName.trim().length > 0;
}

export function summarizeToolValidation(
  results: Record<string, boolean>,
): ToolValidationResult {
  const ok: string[] = [];
  const fail: string[] = [];

  for (const [name, result] of Object.entries(results)) {
    if (result) ok.push(name);
    else fail.push(name);
  }

  return { ok, fail };
}

// -------------------------------------------------------
// Category    :: FONT
// Description :: Show script title.
// -------------------------------------------------------
const FONT_HEIGHT = 10;

const FONT_MAP: Record<string, string[]> = {
  A: [
    "   ░███    ",
    "  ░██░██   ",
    " ░██  ░██  ",
    "░█████████ ",
    "░██    ░██ ",
    "░██    ░██ ",
    "░██    ░██ ",
    "           ",
    "           ",
    "           ",
  ],
  a: [
    "           ",
    "           ",
    " ░██████   ",
    "      ░██  ",
    " ░███████  ",
    "░██   ░██  ",
    " ░█████░██ ",
    "           ",
    "           ",
    "           ",
  ],
  B: [
    "░████████   ",
    "░██    ░██  ",
    "░██    ░██  ",
    "░████████   ",
    "░██     ░██ ",
    "░██     ░██ ",
    "░█████████  ",
    "            ",
    "            ",
    "            ",
  ],
  b: [
    "░██        ",
    "░██        ",
    "░████████  ",
    "░██    ░██ ",
    "░██    ░██ ",
    "░███   ░██ ",
    "░██░█████  ",
    "           ",
    "           ",
    "           ",
  ],
  C: [
    "  ░██████  ",
    " ░██   ░██ ",
    "░██        ",
    "░██        ",
    "░██        ",
    " ░██   ░██ ",
    "  ░██████  ",
    "           ",
    "           ",
    "           ",
  ],
  c: [
    "           ",
    "           ",
    " ░███████  ",
    "░██    ░██ ",
    "░██        ",
    "░██    ░██ ",
    " ░███████  ",
    "           ",
    "           ",
    "           ",
  ],
  D: [
    "░███████   ",
    "░██   ░██  ",
    "░██    ░██ ",
    "░██    ░██ ",
    "░██    ░██ ",
    "░██   ░██  ",
    "░███████   ",
    "           ",
    "           ",
    "           ",
  ],
  d: [
    "       ░██ ",
    "       ░██ ",
    " ░████████ ",
    "░██    ░██ ",
    "░██    ░██ ",
    "░██   ░███ ",
    " ░█████░██ ",
    "           ",
    "           ",
    "           ",
  ],
  E: [
    "░██████████ ",
    "░██         ",
    "░██         ",
    "░█████████  ",
    "░██         ",
    "░██         ",
    "░██████████ ",
    "            ",
    "            ",
    "            ",
  ],
  e: [
    "           ",
    "           ",
    " ░███████  ",
    "░██    ░██ ",
    "░█████████ ",
    "░██        ",
    " ░███████  ",
    "           ",
    "           ",
    "           ",
  ],
  F: [
    "░██████████",
    "░██        ",
    "░██        ",
    "░█████████ ",
    "░██        ",
    "░██        ",
    "░██        ",
    "           ",
    "           ",
    "           ",
  ],
  f: [
    "    ░████ ",
    "   ░██    ",
    "░████████ ",
    "   ░██    ",
    "   ░██    ",
    "   ░██    ",
    "   ░██    ",
    "          ",
    "          ",
    "          ",
  ],
  G: [
    "  ░██████  ",
    " ░██   ░██ ",
    "░██        ",
    "░██  █████ ",
    "░██     ██ ",
    " ░██  ░███ ",
    "  ░█████░█ ",
    "           ",
    "           ",
    "           ",
  ],
  g: [
    "           ",
    "           ",
    " ░████████ ",
    "░██    ░██ ",
    "░██    ░██ ",
    "░██   ░███ ",
    " ░█████░██ ",
    "       ░██ ",
    " ░███████  ",
    "           ",
  ],
  H: [
    "░██     ░██ ",
    "░██     ░██ ",
    "░██     ░██ ",
    "░██████████ ",
    "░██     ░██ ",
    "░██     ░██ ",
    "░██     ░██ ",
    "            ",
    "            ",
    "            ",
  ],
  h: [
    "░██        ",
    "░██        ",
    "░████████  ",
    "░██    ░██ ",
    "░██    ░██ ",
    "░██    ░██ ",
    "░██    ░██ ",
    "           ",
    "           ",
    "           ",
  ],
  I: [
    "░██████   ",
    "  ░██     ",
    "  ░██     ",
    "  ░██     ",
    "  ░██     ",
    "  ░██     ",
    "░██████   ",
    "          ",
    "          ",
    "          ",
  ],
  i: [
    "░██      ",
    "         ",
    "░██      ",
    "░██      ",
    "░██      ",
    "░██      ",
    "░██      ",
    "         ",
    "         ",
    "         ",
  ],
  J: [
    "    ░█████ ",
    "      ░██  ",
    "      ░██  ",
    "      ░██  ",
    "░██   ░██  ",
    "░██   ░██  ",
    " ░██████   ",
    "           ",
    "           ",
    "           ",
  ],
  j: [
    "  ░██    ",
    "         ",
    "  ░██    ",
    "  ░██    ",
    "  ░██    ",
    "  ░██    ",
    "  ░██    ",
    "  ░██    ",
    "░███     ",
    "         ",
  ],
  K: [
    "░██     ░██ ",
    "░██    ░██  ",
    "░██   ░██   ",
    "░███████    ",
    "░██   ░██   ",
    "░██    ░██  ",
    "░██     ░██ ",
    "            ",
    "            ",
    "            ",
  ],
  k: [
    "░██        ",
    "░██        ",
    "░██    ░██ ",
    "░██   ░██  ",
    "░███████   ",
    "░██   ░██  ",
    "░██    ░██ ",
    "           ",
    "           ",
    "           ",
  ],
  L: [
    "░██         ",
    "░██         ",
    "░██         ",
    "░██         ",
    "░██         ",
    "░██         ",
    "░██████████ ",
    "            ",
    "            ",
    "            ",
  ],
  l: [
    "░██ ",
    "░██ ",
    "░██ ",
    "░██ ",
    "░██ ",
    "░██ ",
    "░██ ",
    "    ",
    "    ",
    "    ",
  ],
  M: [
    "░███     ░███ ",
    "░████   ░████ ",
    "░██░██ ░██░██ ",
    "░██ ░████ ░██ ",
    "░██  ░██  ░██ ",
    "░██       ░██ ",
    "░██       ░██ ",
    "              ",
    "              ",
    "              ",
  ],
  m: [
    "                ",
    "                ",
    "░█████████████  ",
    "░██   ░██   ░██ ",
    "░██   ░██   ░██ ",
    "░██   ░██   ░██ ",
    "░██   ░██   ░██ ",
    "                ",
    "                ",
    "                ",
  ],
  N: [
    "           ",
    "           ",
    "░████████  ",
    "░██    ░██ ",
    "░██    ░██ ",
    "░██    ░██ ",
    "░██    ░██ ",
    "           ",
    "           ",
    "           ",
  ],
  n: [
    "░███    ░██ ",
    "░████   ░██ ",
    "░██░██  ░██ ",
    "░██ ░██ ░██ ",
    "░██  ░██░██ ",
    "░██   ░████ ",
    "░██    ░███ ",
    "            ",
    "            ",
    "            ",
  ],
  O: [
    "  ░██████   ",
    " ░██   ░██  ",
    "░██     ░██ ",
    "░██     ░██ ",
    "░██     ░██ ",
    " ░██   ░██  ",
    "  ░██████   ",
    "            ",
    "            ",
    "            ",
  ],
  o: [
    "           ",
    "           ",
    " ░███████  ",
    "░██    ░██ ",
    "░██    ░██ ",
    "░██    ░██ ",
    " ░███████  ",
    "           ",
    "           ",
    "           ",
  ],
  P: [
    "░█████████  ",
    "░██     ░██ ",
    "░██     ░██ ",
    "░█████████  ",
    "░██         ",
    "░██         ",
    "░██         ",
    "            ",
    "            ",
    "            ",
  ],
  p: [
    "           ",
    "           ",
    "░████████  ",
    "░██    ░██ ",
    "░██    ░██ ",
    "░███   ░██ ",
    "░██░█████  ",
    "░██        ",
    "░██        ",
    "           ",
  ],
  Q: [
    "  ░██████   ",
    " ░██   ░██  ",
    "░██     ░██ ",
    "░██     ░██ ",
    "░██     ░██ ",
    " ░██   ░██  ",
    "  ░██████   ",
    "       ░██  ",
    "        ░██ ",
    "            ",
  ],
  q: [
    "           ",
    "           ",
    " ░████████ ",
    "░██    ░██ ",
    "░██    ░██ ",
    "░██   ░███ ",
    " ░█████░██ ",
    "       ░██ ",
    "       ░██ ",
    "           ",
  ],
  R: [
    "░█████████  ",
    "░██     ░██ ",
    "░██     ░██ ",
    "░█████████  ",
    "░██   ░██   ",
    "░██    ░██  ",
    "░██     ░██ ",
    "            ",
    "            ",
    "            ",
  ],
  r: [
    "         ",
    "         ",
    "░██░████ ",
    "░███     ",
    "░██      ",
    "░██      ",
    "░██      ",
    "         ",
    "         ",
    "         ",
  ],
  S: [
    "  ░██████   ",
    " ░██   ░██  ",
    "░██         ",
    " ░████████  ",
    "        ░██ ",
    " ░██   ░██  ",
    "  ░██████   ",
    "            ",
    "            ",
    "            ",
  ],
  s: [
    "           ",
    "           ",
    " ░███████  ",
    "░██        ",
    " ░███████  ",
    "       ░██ ",
    " ░███████  ",
    "           ",
    "           ",
    "           ",
  ],
  T: [
    "░██████████",
    "    ░██    ",
    "    ░██    ",
    "    ░██    ",
    "    ░██    ",
    "    ░██    ",
    "    ░██    ",
    "           ",
    "           ",
    "           ",
  ],
  t: [
    "   ░██    ",
    "   ░██    ",
    "░████████ ",
    "   ░██    ",
    "   ░██    ",
    "   ░██    ",
    "    ░████ ",
    "          ",
    "          ",
    "          ",
  ],
  U: [
    "░██     ░██ ",
    "░██     ░██ ",
    "░██     ░██ ",
    "░██     ░██ ",
    "░██     ░██ ",
    " ░██   ░██  ",
    "  ░██████   ",
    "            ",
    "            ",
    "            ",
  ],
  u: [
    "           ",
    "           ",
    "░██    ░██ ",
    "░██    ░██ ",
    "░██    ░██ ",
    "░██   ░███ ",
    " ░█████░██ ",
    "           ",
    "           ",
    "           ",
  ],
  V: [
    "░██    ░██ ",
    "░██    ░██ ",
    "░██    ░██ ",
    "░██    ░██ ",
    " ░██  ░██  ",
    "  ░██░██   ",
    "   ░███    ",
    "           ",
    "           ",
    "           ",
  ],
  v: [
    "           ",
    "           ",
    "░██    ░██ ",
    "░██    ░██ ",
    " ░██  ░██  ",
    "  ░██░██   ",
    "   ░███    ",
    "           ",
    "           ",
    "           ",
  ],
  W: [
    "░██       ░██ ",
    "░██       ░██ ",
    "░██  ░██  ░██ ",
    "░██ ░████ ░██ ",
    "░██░██ ░██░██ ",
    "░████   ░████ ",
    "░███     ░███ ",
    "            ",
    "            ",
    "            ",
  ],
  w: [
    "                  ",
    "                  ",
    "░██    ░██    ░██ ",
    "░██    ░██    ░██ ",
    " ░██  ░████  ░██  ",
    "  ░██░██ ░██░██   ",
    "   ░███   ░███    ",
    "                  ",
    "                  ",
    "                  ",
  ],
  X: [
    "░██    ░██ ",
    " ░██  ░██  ",
    "  ░██░██   ",
    "   ░███    ",
    "  ░██░██   ",
    " ░██  ░██  ",
    "░██    ░██ ",
    "            ",
    "            ",
    "            ",
  ],
  x: [
    "           ",
    "           ",
    "░██    ░██ ",
    " ░██  ░██  ",
    "  ░█████   ",
    " ░██  ░██  ",
    "░██    ░██ ",
    "            ",
    "            ",
    "            ",
  ],
  Y: [
    "░██     ░██ ",
    " ░██   ░██  ",
    "  ░██ ░██   ",
    "   ░████    ",
    "    ░██     ",
    "    ░██     ",
    "    ░██     ",
    "            ",
    "            ",
    "            ",
  ],
  y: [
    "           ",
    "           ",
    "           ",
    "░██    ░██ ",
    "░██    ░██ ",
    "░██    ░██ ",
    "░██   ░███ ",
    " ░█████░██ ",
    "       ░██ ",
    " ░███████  ",
  ],
  Z: [
    "░█████████ ",
    "      ░██  ",
    "     ░██   ",
    "   ░███    ",
    "  ░██      ",
    " ░██       ",
    "░█████████ ",
    "           ",
    "           ",
    "           ",
  ],
  z: [
    "           ",
    "           ",
    "░█████████ ",
    "     ░███  ",
    "   ░███    ",
    " ░███      ",
    "░█████████ ",
    "           ",
    "           ",
    "           ",
  ],
};

function getGlyph(char: string): string[] {
  return FONT_MAP[char] ?? [char];
}

export function showScriptTitle(word: string): string {
  const lines: string[] = Array.from({ length: FONT_HEIGHT }, () => "");

  for (let i = 0; i < FONT_HEIGHT; i += 1) {
    let line = "";
    for (const letter of word) {
      const glyph = getGlyph(letter);
      line += `${glyph[i] ?? " "} `;
    }
    lines[i] = line.trimEnd();
  }

  return lines.join("\n");
}
