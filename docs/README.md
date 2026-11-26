# scriptdx Example Scenarios

This document explains each category with copy-paste examples based on `docs/example.ts` and `docs/scenarios.ts`.

## How To Run

```bash
npm run tutorial
```

The script starts an interactive terminal menu and lets you run one scenario at a time.

## How to use scriptdx with examples

### Logger

```ts
import {
  logColor,
  logError,
  logInfo,
  logQuestion,
  logSection,
  logSuccess,
  logTopic,
  logWarning,
  color,
  debug,
  error,
  info,
  styles,
  success,
  warning,
} from "../src/index";

logSection(
  "Log Functions",
  "Colored logging examples with icons, labels, and style helpers.",
);
logColor("red", "Red", "(optional text)");
logTopic("Example Log Icons");
logInfo("Starting simulated process...");
logWarning("Low disk space");
logError("Failed to connect to database");
logSuccess("Process completed");
logQuestion("Please select an option.");

logTopic("Backward-Compatible Aliases");
success("Alias: success");
info("Alias: info");
warning("Alias: warning");
error("Alias: error");
debug("Alias: debug");

logTopic("Color Object");
process.stdout.write(`${color.green("Plain green text")}\n`);
process.stdout.write(`${color.red.bold("Bold red text")}\n`);
process.stdout.write(`${color.red.bold.underline("Bold underlined red")}\n`);
process.stdout.write(`${color.cyan("Cyan text")}\n`);
```

### System

```ts
import { getPlatform, isLinux, isMac, isWindows } from "../src/index";

process.stdout.write(`isLinux(): ${String(isLinux())}\n`);
process.stdout.write(`isWindows(): ${String(isWindows())}\n`);
process.stdout.write(`isMac(): ${String(isMac())}\n`);
process.stdout.write(`platform: ${getPlatform()}\n`);
```

### Loading

```ts
import { simpleLoading, linearLoading } from "../src/index";

await simpleLoading(8, 35);

await linearLoading("▁▂▃▅▆▇▇▆▅▃▂▁", 4, 35);
await linearLoading("░▒▓█▓▒░░▒▓█▓▒░", 4, 35);

const controller = new AbortController();
await simpleLoading({ repeat: 0, signal: controller.signal });
```

### Menu

```ts
import { runMenuByIndex } from "../src/index";

const menuItems = [
  { label: "Build project", run: async () => process.stdout.write("Build done.\n") },
  { label: "Run tests", run: async () => process.stdout.write("Tests done.\n") },
];

await runMenuByIndex(menuItems, 0);
```

### Step

```ts
import { runStep } from "../src/index";

const result = await runStep(async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
}, "Building project", { showDuration: true });

if (!result.ok) {
  throw result.error;
}

process.stdout.write(`durationMs: ${String(result.durationMs)}\n`);
```

`runStep` returns a `StepResult`. Use `runStepLegacy` if you still need a `boolean`.

### Spinner (backward-compatible)

```ts
import { createSpinner } from "../src/index";

const spinner = createSpinner({ intervalMs: 80, frames: "arrow" });
spinner.start("Manual spinner in progress");
await new Promise((resolve) => setTimeout(resolve, 300));
spinner.stop("Manual spinner finished");
```

### Table

```ts
import { showTable, showTableWithBorders } from "../src/index";

const header = ["Emulator", "Host:Port", "View in Emulator UI"];
const rows = [
  ["Functions", "localhost:5001", "http://localhost:4000/functions"],
  ["Database", "localhost:9000", "http://localhost:4000/database"],
  ["Hosting", "localhost:5000", "n/a"],
  ["Pub/Sub", "localhost:8085", "n/a"],
];

process.stdout.write(`${showTable(header, rows)}\n`);
process.stdout.write(`${showTableWithBorders(header, rows)}\n`);
process.stdout.write(`${showTable(header, rows, { maxWidth: 18, maxRows: 2 })}\n`);
```

### Validations

```ts
import { color, hasTool, logError, logSuccess, logTopic, summarizeToolValidation } from "../src/index";

const toolMap = {
  git: hasTool("git"),
  node: hasTool("node"),
  npm: hasTool("npm"),
  docker: hasTool("docker"),
  curl: hasTool("curl"),
};

for (const [name, ok] of Object.entries(toolMap)) {
  if (ok) {
    logSuccess(`${name} installed`);
  } else {
    logError(`${name} not found`);
  }
}

const summary = summarizeToolValidation(toolMap);
logTopic("Validation summary");
process.stdout.write(`${color.green("ok")}: ${summary.ok.join(", ")}\n`);
process.stdout.write(`${color.red("fail")}: ${summary.fail.join(", ")}\n`);
```

`hasTool` now requires a bare executable name that exists on `PATH`.

### Font

```ts
import { showScriptTitle } from "../src/font/index";

process.stdout.write(`${showScriptTitle("SCRIPTDX")}\n`);
process.stdout.write(`${showScriptTitle("DX", { font: "banner", border: true })}\n`);
```

### Format & ANSI

```ts
import { color, formatBytes, formatDuration, formatNumber, stringWidth, truncate } from "../src/index";

process.stdout.write(`${formatBytes(1536)}\n`);
process.stdout.write(`${formatNumber(1_234_567)}\n`);
process.stdout.write(`${formatDuration(90_000, { compact: true })}\n`);
process.stdout.write(`${String(stringWidth(color.red("ERROR")))}\n`);
process.stdout.write(`${truncate("This is a very long message", 15)}\n`);
```

### Diff & Retry

```ts
import { retry, showDiff } from "../src/index";

showDiff("hello\nworld\n", "hello\nthere\n");

let attempts = 0;
const result = await retry(
  () => {
    attempts += 1;
    if (attempts < 2) return Promise.reject(new Error("transient failure"));
    return Promise.resolve("ready");
  },
  { maxAttempts: 3, initialDelay: 40, jitter: false, log: false },
);

if (result.ok) {
  process.stdout.write(`retry succeeded after ${String(result.attempts)} attempt(s)\n`);
}
```

### Box, Tree & JSON

```ts
import { box, callout, highlightJson, showTree, treeFromPaths } from "../src/index";

process.stdout.write(`${box("Deploy complete", { preset: "success", title: "Status" })}\n`);
process.stdout.write(`${callout("Check logs before shipping", "warning")}\n`);
process.stdout.write(`${showTree(treeFromPaths(["src/index.ts", "docs/API.md"]))}\n`);
process.stdout.write(`${highlightJson({ name: "scriptdx", version: "2.0.0" })}\n`);
```

### Gradient & Links

```ts
import { applyGradient, link } from "../src/index";

process.stdout.write(`${applyGradient("scriptdx", "ocean")}\n`);
process.stdout.write(
  `${link("API docs", "https://github.com/whosramoss/scriptdx/blob/main/docs/API.md")}\n`,
);
```
