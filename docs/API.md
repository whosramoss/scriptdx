# scriptdx API Reference

Terminal toolkit for colorful logs, loading effects, tables, steps, and CLI output. Logger, loading, and menu helpers write to `process.stdout` by default. `createSpinner` and the `runStep` spinner write to `process.stderr` unless a `stream` is provided. Pass `{ stream }` to redirect any of these writers.

```ts
import { logSuccess, runStep, showTable } from "scriptdx";
```

Requires **Node.js 18+**. See [README.md](https://github.com/whosramoss/scriptdx/blob/main/docs/README.md) for runnable examples.

---

## Logger

All logger helpers accept an optional last argument `{ stream?: NodeJS.WritableStream }` (type `OutputOptions`). Default: `process.stdout`.

### `logColor(color, prefix, message?, options?)`

Write a line with ANSI styling. `color` is a key of `styles` (see below). `prefix` is the left label; `message` is optional trailing text.

```ts
logColor("lightGreen", "✔", "Build complete", { stream: customStream });
```

### `logSuccess(message, options?)` / `logInfo(message, options?)` / `logWarning(message, options?)` / `logError(message, options?)` / `logQuestion(message, options?)`

Convenience loggers with icons (✔, i, ⚠, ✖, ?).

### `logSection(title, subtitle?, options?)`

Print a section header with a green divider line, bright title, and optional subtitle.

### `logTopic(topic, options?)`

Print a topic line with `➤` prefix and surrounding blank lines.

### `styles`

Record of ANSI SGR codes: `black`, `red`, `green`, `yellow`, `blue`, `purple`, `cyan`, `white`, `darkGray`, `lightRed`, `lightGreen`, `lightYellow`, `lightBlue`, `lightPurple`, `lightCyan`, `brightWhite`, plus `reset`.

### `color`

Object of chainable color functions: `color.black`, `color.red`, `color.green`, `color.yellow`, `color.blue`, `color.magenta`, `color.cyan`, `color.white`. Each returns a string and exposes `.bold` for bold variant. ANSI sequences are omitted when color is disabled.

### `isColorEnabled()` / `setColorEnabled(enabled)`

Color is off when `NO_COLOR` is set, on when `FORCE_COLOR` is set, otherwise follows `process.stdout.isTTY`. `setColorEnabled` overrides that detection.

```ts
import { setColorEnabled, isColorEnabled } from "scriptdx";
setColorEnabled(false);
```

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

### `simpleLoading(repeat?, delayMs?, options?): Promise<void>`

### `simpleLoading(options?): Promise<void>`

Cycle frames `| / - \\`. Default `repeat = 2`, `delayMs = 80`. If `repeat <= 0`, loops until `signal` aborts. Abort resolves the promise and does not throw. The spinner line is cleared when the function returns. `stream` defaults to `process.stdout`.

```ts
await simpleLoading(2, 80);
await simpleLoading({ repeat: 0, signal: controller.signal, stream });
```

### `linearLoading(text, repeat?, delayMs?, options?): Promise<void>`

### `linearLoading(text, options?): Promise<void>`

### `linearLoading(options): Promise<void>`

Rotate characters of `text` as a loading line. Defaults: `repeat = 2`, `delayMs = 80`. `repeat <= 0` runs until `signal` aborts. The object form requires `text`. The animation line is cleared when the function returns.

### `LoadingOptions`

`{ repeat?: number; delayMs?: number; signal?: AbortSignal; stream?: WritableStream }`

### `LinearLoadingOptions`

`LoadingOptions & { text: string }`

---

## Menu

### `MenuItem`

```ts
type MenuItem = {
  label: string;
  run: () => void | Promise<void>;
};
```

### `runMenuByIndex(items, selectedIndex, options?): Promise<void>`

Run the menu item at `selectedIndex`. Logs a warning if the index is invalid. Optional `stream` defaults to `process.stdout`.

---

## Step & spinner

### `runStep(task, message, options?): Promise<StepResult>`

Run async `task` while showing a Braille spinner on **stderr**. On success: clears the line, calls `logSuccess(message)`, and returns `{ ok: true, durationMs }`. On failure: calls `logError(message)` and returns `{ ok: false, error, durationMs }` with the thrown value. A timeout calls `logWarning` and sets `error` to `TimeoutError`. When `options.stream` is set, both the spinner and the final log write to that stream.

**Options:** `timeoutMs` (omit or `0` for no timeout), `timeoutMessage`, `showDuration` (default `false`), `stream`.

### `runStepLegacy(task, message, options?): Promise<boolean>`

Same behavior as `runStep`. Returns `result.ok`.

### `StepResult`

```ts
type StepResult =
  | { ok: true; durationMs: number }
  | { ok: false; error: unknown; durationMs: number };
```

### `TimeoutError`

`Error` thrown when `timeoutMs` elapses. `timeoutMs` is the configured limit. `name` is `"TimeoutError"`.

### `createSpinner(options?): Spinner`

Manual spinner control.

**Options:** `intervalMs` (default `80`), `stream` (default `process.stderr`).

**Spinner methods:**

- `start(text?)` — begin animation
- `stop(finalLine?)` — clear line; optionally write `finalLine` with newline

---

## Table

### `showTable(header, rows, options?): string`

Aligned columns. Default width is **24** chars per column (backward-compatible). Pass `{ columnWidth: "auto" }` to size each column to its content, optionally with `minWidth`. Returns a multi-line string (does not print).

```ts
showTable(["ID", "Name"], data, { columnWidth: "auto", minWidth: 10 });
```

### `showTableWithBorders(header, rows): string`

Box-drawn table with dynamic column widths. Returns multi-line string.

### `TableRow`

`string[]` — one row of cell values.

### `TableOptions`

`{ columnWidth?: number | "auto"; minWidth?: number }`

---

## Validations

### `hasTool(toolName): boolean`

Returns `true` when `toolName` is a bare executable name found on `PATH`. On Windows, `.exe`, `.cmd`, `.bat`, and `.ps1` are also checked. Paths are rejected. Does not execute the binary.

### `summarizeToolValidation(results): ToolValidationResult`

Split a `Record<string, boolean>` into `{ ok: string[], fail: string[] }`.

---

## Font

Prefer `import { showScriptTitle } from "scriptdx/font"` so the glyph map is not part of the main entry graph. `showScriptTitle` remains available from `scriptdx` for compatibility; the map is allocated on first call either way.

### `showScriptTitle(word): string`

Render `word` as large block-letter ASCII art (built-in glyph map). Returns multi-line string.

---

## Types exported

- `LoggerColor` — keyof `styles`
- `ColorChain` — color function with `.bold`
- `OutputOptions` — `{ stream?: NodeJS.WritableStream }`
- `MenuItem`
- `Spinner`, `SpinnerOptions`
- `StepResult`
- `RunStepOptions`
- `TimeoutError`
- `TableRow`
- `TableOptions`
- `ToolValidationResult`
- `LoadingOptions`, `LinearLoadingOptions`
