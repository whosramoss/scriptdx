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

Object of chainable color functions: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, plus `gray` and `brightRed`, `brightGreen`, `brightYellow`, `brightBlue`, `brightMagenta`, `brightCyan`, `brightWhite`. Each returns a string. Modifiers chain in call order: `.bold`, `.dim`, `.italic`, `.underline`, `.strikethrough`, `.inverse`. ANSI sequences are omitted when color is disabled.

```ts
color.red.bold.underline("error");
color.brightCyan("ok");
```

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

### `isMac(): boolean` / `isDarwin(): boolean`

`true` when `process.platform === "darwin"`. `isDarwin` is an alias of `isMac`.

### `getPlatform(): Platform`

`"windows"`, `"linux"`, `"mac"`, or `"unknown"`.

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

**Options:** `timeoutMs` (omit or `0` for no timeout), `timeoutMessage`, `showDuration` (default `false`), `spinnerFrames`, `spinnerColor`, `stream`.

`durationMs` is always present on the result. With `showDuration: true`, the success line becomes `✔ Building (3.2s)`. The label uses `250ms` under one second, `3.2s` under one minute, and `2m 15s` after that. A timeout still logs the timeout warning.

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

**Options:** `intervalMs` (default `80`), `frames` (preset name or custom array, default `"dots"`), `color`, `stream` (default `process.stderr`).

**Spinner methods:**

- `start(text?)` — begin animation
- `stop(finalLine?)` — clear line; optionally write `finalLine` with newline

---

## Table

### `showTable(header, rows, options?): string`

Aligned columns. Default width is **24** chars per column (backward-compatible). Pass `{ columnWidth: "auto" }` to size each column to its content, optionally with `minWidth`. `maxWidth` truncates cells, `wrap` breaks them onto extra lines, and `maxRows` appends `... and N more rows`. `headerStyle` can be `"uppercase"`, `"capitalize"`, or `"none"`. Returns a multi-line string (does not print).

```ts
showTable(["ID", "Name"], data, { columnWidth: "auto", minWidth: 10 });
```

### `showTableWithBorders(header, rows): string`

Box-drawn table with dynamic column widths. Returns multi-line string.

### `TableRow`

`string[]` — one row of cell values.

### `TableOptions`

`{ columnWidth?: number | "auto" | number[]; minWidth?: number; maxWidth?: number; ellipsis?: string; wrap?: boolean; maxRows?: number; headerStyle?: "uppercase" | "capitalize" | "none" }`

### `createTableBuilder(defaultOptions?)`

Returns `{ compact, full, paginated }`. `compact` uses auto width and `maxWidth: 30`. `full` wraps. `paginated(header, rows, page, pageSize = 10)` appends a page footer.

---

## Validations

### `hasTool(toolName): boolean`

Returns `true` when `toolName` is a bare executable name found on `PATH`. On Windows, `.exe`, `.cmd`, `.bat`, and `.ps1` are also checked. Paths are rejected. Does not execute the binary.

### `summarizeToolValidation(results): ToolValidationResult`

Split a `Record<string, boolean>` into `{ ok: string[], fail: string[] }`.

---

## ANSI strings

`stripAnsi`, `hasAnsi`, and `stringWidth` ignore escape sequences. `padEnd`, `padStart`, and `center` pad to a visible width and keep existing codes. `truncate` and `wrapText` return plain text. `truncate` appends `"…"` when the visible text is longer than `maxWidth`.

```ts
stringWidth(color.red("ERROR")); // 5
padEnd(color.green("OK"), 10);
truncate("This is a very long message", 15); // "This is a very…"
```

---

## Font

Import `showScriptTitle` from `scriptdx/font`. The main `scriptdx` entry does not load the glyph module. The map is allocated on the first call.

### `showScriptTitle(text, options?): string`

Render `text` as ASCII art. `options.font` is `"standard"` (10-line glyph map, loaded on first use), `"banner"` (5-line compact font), or `"slant"` (the banner glyphs shifted one column per row). `color`, `align` (`"left" | "center" | "right"`), `border`, `borderStyle`, `padding`, and `maxWidth` are optional.

### `getAvailableFonts(): FontName[]`

Returns `["standard", "banner", "slant"]`.

### `printTitle(text, options?): void`

Prints `showScriptTitle` to stdout.

---

## Format

`formatBytes(bytes, options?)` uses decimal units by default (`1000`) and binary units when `binary: true`. `formatNumber` abbreviates with K/M/B. `formatDuration` spells units by default and uses `1m 30s` when `compact: true`. `formatPercent(0.755)` returns `"75.5%"`. `formatRelativeTime(date, { now })` returns strings such as `"1 minute ago"`.

## Diff

`diff(oldText, newText)` returns `{ lines, additions, deletions, hasChanges }`. `formatDiff` colors the hunks. `showDiff` writes a unified header to `stdout` unless `{ stream }` or `header: "none"` is set. `inlineDiff` highlights the changed middle of one line.

## Retry

`retry(fn, options?)` returns `{ ok: true, value, attempts, totalTime }` or `{ ok: false, error, attempts, totalTime, errors }`. It does not throw. `retryAsync` throws the last error. `withRetry` wraps a function. `retryLinear` and `retryFixed` keep a constant delay. Set `jitter: false` in tests.

## Spinner frames

`spinnerPresets` and `getSpinnerFrames(preset)` expose `dots`, `line`, `arrow`, `ascii`, and the other named sets. `createSpinner({ frames, color })` accepts a preset name or a custom array. `runStep` accepts `spinnerFrames` and `spinnerColor`.

## Box

`box(text, options?)` draws a border. Presets: `info`, `success`, `warning`, `error`, `default`. `banner` is full width. `callout(text, type?)` uses rounded corners. `separator()` draws a horizontal rule. `printBox` writes to stdout.

## Tree

`showTree(node, options?)` renders `├──` guides (`ascii: true` switches to `|---`). `treeFromPaths(paths)` and `treeFromObject(obj, name?)` build nodes. `printTree` writes to stdout.

## JSON

`highlightJson(value, options?)` colorizes a pretty-printed value. `compactJson` stays on one line. `parseJsonSafe` returns `{ ok: true, value }` or `{ ok: false, error, position? }`. `printJson` writes to stdout.

## Gradient

`gradient(text, colors, options?)` paints truecolor stops. It returns plain text when color is disabled. `gradientPresets` and `applyGradient(text, preset)` cover `rainbow`, `ocean`, `sunset`, and the other named sets. `gradientBanner` adds a one-line frame. `animateGradient` shifts the stops on stdout.

## Links

`supportsHyperlinks()` checks `TERM_PROGRAM`, `WT_SESSION`, `KONSOLE_VERSION`, and `COLORTERM=truecolor`. `link(text, url, options?)` emits OSC 8 when that check passes, otherwise `"label (url)"`. `mailto`, `fileLink`, `linkify`, `linkList`, `breadcrumb`, and `printLink` build on the same helper.

---

## Types exported

- `LoggerColor` — keyof `styles`
- `ColorChain` — color function with chainable style modifiers
- `Modifier` — keyof `modifiers`
- `OutputOptions` — `{ stream?: NodeJS.WritableStream }`
- `MenuItem`
- `Spinner`, `SpinnerOptions`
- `SpinnerPreset`
- `StepResult`
- `RunStepOptions`
- `TimeoutError`
- `FontName`, `TitleOptions` — from `scriptdx/font`
- `TableRow`
- `TableOptions`
- `ByteFormatOptions`, `NumberFormatOptions`, `DurationFormatOptions`, `PercentFormatOptions`, `RelativeTimeOptions`
- `DiffLine`, `DiffResult`, `DiffOptions`
- `RetryOptions`, `RetryResult`
- `BoxStyle`, `BoxPreset`, `BoxOptions`
- `TreeNode`, `TreeOptions`
- `JsonHighlightOptions`
- `GradientColor`, `GradientOptions`, `GradientPreset`
- `LinkOptions`
- `ToolValidationResult`
- `LoadingOptions`, `LinearLoadingOptions`
- `Platform`
