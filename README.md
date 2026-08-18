<h1>
  <p align="center">
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

await runStep(async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
}, "Building project");

logSuccess("Build finished");

const table = showTable(
  ["Service", "Port"],
  [
    ["API", "3000"],
    ["Worker", "3001"],
  ],
);
process.stdout.write(`${table}\n`);

logWarning("Dry run only");
logError("Connection refused (example)");
```

Run the interactive tutorial from the repo:

```bash
npm run tutorial
```

See **[docs/README.md](https://github.com/whosramoss/scriptdx/blob/main/docs/README.md)** for copy-paste examples per category (logger, loading, menu, table, validations, font, and more).

## Features

| Category        | Highlights                                                               |
| --------------- | ------------------------------------------------------------------------ |
| **Logger**      | `logInfo`, `logSuccess`, `logWarning`, `logError`, `logColor`, `color.*` |
| **Loading**     | `simpleLoading`, `linearLoading` with custom frame strings               |
| **Step**        | `runStep` — async tasks with spinner and success/failure feedback        |
| **Spinner**     | `createSpinner` for manual progress control                              |
| **Table**       | `showTable`, `showTableWithBorders` for aligned terminal tables          |
| **Menu**        | `runMenuByIndex` for numbered CLI menus                                  |
| **Validations** | `hasTool`, `summarizeToolValidation` for dependency checks               |
| **System**      | `isLinux`, `isWindows`                                                   |
| **Font**        | `showScriptTitle` — large ASCII banner text                              |
