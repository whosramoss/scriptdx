# scriptdx Example Scenarios

This document explains each category with copy-paste examples based on `docs/example.ts`.

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
process.stdout.write(`${color.cyan("Cyan text")}\n`);
```

### System

```ts
import { isLinux, isWindows } from "../src/index";

process.stdout.write(`isLinux(): ${String(isLinux())}\n`);
process.stdout.write(`isWindows(): ${String(isWindows())}\n`);
```

### Loading

```ts
import { simpleLoading, linearLoading } from "../src/index";

await simpleLoading(8, 35);

await linearLoading("▁▂▃▅▆▇▇▆▅▃▂▁", 4, 35);
await linearLoading("░▒▓█▓▒░░▒▓█▓▒░", 4, 35);
await linearLoading("[=] [=] [=] [=] ", 4, 35);
await linearLoading(" > > > > >", 4, 35);
await linearLoading("# # # # # # ", 4, 35);
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

await runStep(async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
}, "1. Waiting before creating a resource");

await runStep(async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
}, "2. Creating the resource");

await runStep(async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
}, "3. Deleting the resource");
```

### Spinner (backward-compatible)

```ts
import { createSpinner } from "../src/index";

const spinner = createSpinner({ intervalMs: 80 });
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

### Font

```ts
import { showScriptTitle } from "../src/index";

process.stdout.write(`${showScriptTitle("SCRIPTDX")}\n`);
```
