# scriptdx API Reference

Terminal toolkit for colorful logs, loading effects, tables, steps, and CLI output. All functions write to `process.stdout` or `process.stderr` unless noted.

```ts
import { logSuccess, runStep, showTable } from "scriptdx";
```

Requires **Node.js 18+**. See [README.md](https://github.com/whosramoss/scriptdx/blob/main/docs/README.md) for runnable examples.

---

## Logger

### `logColor(color, prefix, message?)`

Write a line with ANSI styling. `color` is a key of `styles` (see below). `prefix` is the left label; `message` is optional trailing text.

### `logSuccess(message)` / `logInfo(message)` / `logWarning(message)` / `logError(message)` / `logQuestion(message)`

Convenience loggers with icons (✔, i, ⚠, ✖, ?).

### `logSection(title, subtitle?)`

Print a section header with a green divider line, bright title, and optional subtitle.

### `logTopic(topic)`

Print a topic line with `➤` prefix and surrounding blank lines.

### `styles`

Record of ANSI SGR codes: `black`, `red`, `green`, `yellow`, `blue`, `purple`, `cyan`, `white`, `darkGray`, `lightRed`, `lightGreen`, `lightYellow`, `lightBlue`, `lightPurple`, `lightCyan`, `brightWhite`, plus `reset`.

### `color`

Object of chainable color functions: `color.black`, `color.red`, `color.green`, `color.yellow`, `color.blue`, `color.magenta`, `color.cyan`, `color.white`. Each returns a string and exposes `.bold` for bold variant.

### Aliases

| Function    | Equivalent   |
| ----------- | ------------ |
| `success`   | `logSuccess` |
| `info`      | `logInfo`    |
| `warning`   | `logWarning` |
| `error`     | `logError`   |
| `debug`     | `logColor("lightPurple", "●", message)` |

---

## System

### `isLinux(): boolean`

`true` when `process.platform === "linux"`.

### `isWindows(): boolean`

`true` when `process.platform === "win32"`.

---

## Loading

### `simpleLoading(repeat?, delayMs?): Promise<void>`

Cycle frames `| / - \\` on stdout. Default `repeat = 2`, `delayMs = 80`. If `repeat <= 0`, loops until interrupted externally.

### `linearLoading(text, repeat?, delayMs?): Promise<void>`

Rotate characters of `text` as a loading line. Defaults: `repeat = 2`, `delayMs = 80`.

---

## Menu

### `MenuItem`

```ts
type MenuItem = {
  label: string;
  run: () => void | Promise<void>;
};
```

### `runMenuByIndex(items, selectedIndex): Promise<void>`

Run the menu item at `selectedIndex`. Logs a warning if the index is invalid.

---

## Step & spinner

### `runStep(task, message): Promise<boolean>`

Run async `task` while showing a Braille spinner on **stderr**. On success: clears line and `logSuccess(message)`; returns `true`. On failure: `logError(message)`; returns `false`.

### `createSpinner(options?): Spinner`

Manual spinner control.

**Options:** `intervalMs` (default `80`), `stream` (default `process.stderr`).

**Spinner methods:**

- `start(text?)` — begin animation
- `stop(finalLine?)` — clear line; optionally write `finalLine` with newline

---

## Table

### `showTable(header, rows): string`

Aligned columns with fixed width (24 chars per column). Returns multi-line string (does not print).

### `showTableWithBorders(header, rows): string`

Box-drawn table with dynamic column widths. Returns multi-line string.

### `TableRow`

`string[]` — one row of cell values.

---

## Validations

### `hasTool(toolName): boolean`

Heuristic check that `toolName` is non-empty and `PATH` has directories (does not execute the binary).

### `summarizeToolValidation(results): ToolValidationResult`

Split a `Record<string, boolean>` into `{ ok: string[], fail: string[] }`.

---

## Font

### `showScriptTitle(word): string`

Render `word` as large block-letter ASCII art (built-in glyph map). Returns multi-line string.

---

## Types exported

- `LoggerColor` — keyof `styles`
- `ColorChain` — color function with `.bold`
- `MenuItem`
- `Spinner`, `SpinnerOptions`
- `TableRow`
- `ToolValidationResult`
