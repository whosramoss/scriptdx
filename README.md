<h1>
  <p align="center">
    <img src="https://scriptdx.whosramoss.com/public/icons/android-chrome-192x192.png" alt="logo" width="128">
    <br>scriptdx
  </p>
</h1>

<p align="center">
  Terminal toolkit for colorful logs, loading effects, tables, steps, and CLI output.
  <br /> <br />
  <a href="#how-to-install">Install</a>
  ·
  <a href="#usage">Usage</a>
  ·
  <a href="#features">Features</a>
</p>

<p align="center">
  <a href="https://scriptdx.whosramoss.com">Live demo</a>
</p>

## How to install

```bash
npm install scriptdx
```

## Usage

Import what you need and write to `stdout` / `stderr` like any CLI script:

```ts
import {
  logSection,
  logSuccess,
  logWarning,
  logError,
  runStep,
  showTable,
} from "scriptdx";

logSection("Deploy", "Example workflow with scriptdx");

const result = await runStep(async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
}, "Building project", { showDuration: true });

if (!result.ok) {
  logError("Build failed");
  process.exitCode = 1;
} else {
  logSuccess("Build finished");
}

const table = showTable(
  ["Service", "Port"],
  [
    ["API", "3000"],
    ["Worker", "3001"],
  ],
);
process.stdout.write(`${table}\n`);

logWarning("Dry run only");
```

`runStep` now returns a `StepResult`. Use `runStepLegacy` if you still want a `boolean`.

Run the interactive tutorial from the repo:

```bash
npm run tutorial
```

See **[docs/README.md](https://github.com/whosramoss/scriptdx/blob/main/docs/README.md)** for copy-paste examples per category, and **[docs/API.md](https://github.com/whosramoss/scriptdx/blob/main/docs/API.md)** for the full reference.

## Features

| Category        | Highlights                                                                 |
| --------------- | -------------------------------------------------------------------------- |
| **Logger**      | `logInfo`, `logSuccess`, `logWarning`, `logError`, `logColor`, `color.*`   |
| **Loading**     | `simpleLoading`, `linearLoading` with `AbortSignal`                        |
| **Step**        | `runStep` returns `StepResult`; timeout, duration, and spinner presets     |
| **Spinner**     | `createSpinner` with named frames and color                                |
| **Table**       | `showTable`, truncation, wrapping, `createTableBuilder`                    |
| **Menu**        | `runMenuByIndex` for numbered CLI menus                                    |
| **Validations** | `hasTool` checks executables on `PATH`; `summarizeToolValidation`          |
| **System**      | `isLinux`, `isWindows`, `isMac`, `getPlatform`                             |
| **Font**        | `showScriptTitle` via `scriptdx/font` — `standard`, `banner`, `slant`      |
| **Format**      | `formatBytes`, `formatNumber`, `formatDuration`, `formatRelativeTime`      |
| **Diff**        | `diff`, `formatDiff`, `showDiff`, `inlineDiff`                             |
| **Retry**       | `retry`, `retryAsync`, `withRetry` with backoff                            |
| **Layout**      | `box`, `banner`, `callout`, `showTree`, `highlightJson`                    |
| **Style**       | Gradients, OSC 8 links, and ANSI width helpers                             |
