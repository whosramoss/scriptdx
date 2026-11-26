import {
  applyGradient,
  box,
  callout,
  color,
  debug,
  error,
  formatBytes,
  formatDuration,
  formatNumber,
  getPlatform,
  hasTool,
  highlightJson,
  info,
  isLinux,
  isMac,
  isWindows,
  linearLoading,
  link,
  logColor,
  logError,
  logInfo,
  logQuestion,
  logSection,
  logSuccess,
  logTopic,
  logWarning,
  retry,
  runStep,
  showDiff,
  showTable,
  showTableWithBorders,
  showTree,
  simpleLoading,
  stringWidth,
  styles,
  success,
  summarizeToolValidation,
  treeFromPaths,
  truncate,
  warning,
} from "../src/index";
import { showScriptTitle } from "../src/font/index";

export function runLogsExample(): void {
  logSection(
    "Log Functions",
    "Colored logging examples with icons, labels, and style helpers.",
  );

  logTopic("Example Color Functions");
  logColor("black", "Black", "(optional text)");
  logColor("red", "Red", "(optional text)");
  logColor("green", "Green", "(optional text)");
  logColor("yellow", "Yellow", "(optional text)");
  logColor("blue", "Blue", "(optional text)");
  logColor("purple", "Purple", "(optional text)");
  logColor("cyan", "Cyan", "(optional text)");
  logColor("white", "White", "(optional text)");
  logColor("darkGray", "Dark Gray", "(optional text)");
  logColor("lightRed", "Light Red", "(optional text)");
  logColor("lightGreen", "Light Green", "(optional text)");
  logColor("lightYellow", "Light Yellow", "(optional text)");
  logColor("lightBlue", "Light Blue", "(optional text)");
  logColor("lightPurple", "Light Purple", "(optional text)");
  logColor("lightCyan", "Light Cyan", "(optional text)");
  logColor("brightWhite", "Bright White", "(optional text)");

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
  process.stdout.write(
    `Available style keys: ${Object.keys(styles).join(", ")}\n`,
  );
}

export function runTableExample(): void {
  logSection(
    "Table Functions",
    "Formatted table output with and without borders.",
  );

  const header = ["Emulator", "Host:Port", "View in Emulator UI"];
  const rows = [
    ["Functions", "localhost:5001", "http://localhost:4000/functions"],
    ["Database", "localhost:9000", "http://localhost:4000/database"],
    ["Hosting", "localhost:5000", "n/a"],
    ["Pub/Sub", "localhost:8085", "n/a"],
  ];

  logTopic("Example Table simple");
  process.stdout.write(`${showTable(header, rows)}\n`);

  logTopic("Example Table with borders");
  process.stdout.write(`${showTableWithBorders(header, rows)}\n`);

  logTopic("Truncated table");
  process.stdout.write(
    `${showTable(header, rows, { maxWidth: 18, maxRows: 2 })}\n`,
  );
}

export async function runStepExample(): Promise<void> {
  logSection(
    "Step Functions",
    "Run named steps with spinner feedback and a typed StepResult.",
  );

  const first = await runStep(async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
  }, "1. Waiting before creating a resource", { showDuration: true });

  const second = await runStep(async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
  }, "2. Creating the resource");

  const third = await runStep(async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
  }, "3. Deleting the resource");

  if (first.ok && second.ok && third.ok) {
    logSuccess(`All steps finished in ${first.durationMs + second.durationMs + third.durationMs}ms`);
  }
}

export function runValidationsExample(): void {
  logSection(
    "Validations Functions",
    "Check available tools and summarize status.",
  );

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
}

export async function runLoadingExample(): Promise<void> {
  logSection(
    "Loading Functions",
    "Animated loading effects for terminal feedback.",
  );

  logTopic("Example Simple Loading");
  await simpleLoading(8, 35);

  logTopic("Example Linear Loading");
  await linearLoading("▁▂▃▅▆▇▇▆▅▃▂▁", 4, 35);
  await linearLoading("░▒▓█▓▒░░▒▓█▓▒░", 4, 35);
  await linearLoading("[=] [=] [=] [=] ", 4, 35);
  await linearLoading(" > > > > >", 4, 35);
  await linearLoading("# # # # # # ", 4, 35);
}

export function runSystemExample(): void {
  logSection("Extras", "Complementary examples for font and system helpers.");

  logTopic("System");
  process.stdout.write(`isLinux(): ${String(isLinux())}\n`);
  process.stdout.write(`isWindows(): ${String(isWindows())}\n`);
  process.stdout.write(`isMac(): ${String(isMac())}\n`);
  process.stdout.write(`platform: ${getPlatform()}\n`);

  logTopic("Font");
  process.stdout.write(`${showScriptTitle("DX", { font: "banner", border: true })}\n`);
}

export function runFormatExample(): void {
  logSection("Format & ANSI", "Human-readable values and visible string width.");

  process.stdout.write(`formatBytes(1536): ${formatBytes(1536)}\n`);
  process.stdout.write(`formatNumber(1234567): ${formatNumber(1_234_567)}\n`);
  process.stdout.write(
    `formatDuration(90000): ${formatDuration(90_000, { compact: true })}\n`,
  );
  process.stdout.write(
    `stringWidth(color.red("ERROR")): ${String(stringWidth(color.red("ERROR")))}\n`,
  );
  process.stdout.write(
    `truncate: ${truncate("This is a very long message", 15)}\n`,
  );
}

export async function runDiffRetryExample(): Promise<void> {
  logSection("Diff & Retry", "Colored diffs and typed retry results.");

  logTopic("Diff");
  showDiff("hello\nworld\n", "hello\nthere\n");

  logTopic("Retry");
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
    logSuccess(`retry succeeded after ${String(result.attempts)} attempt(s)`);
  } else {
    logError("retry exhausted");
  }
}

export function runLayoutExample(): void {
  logSection("Box, Tree & JSON", "Decorative layout and highlighted data.");

  process.stdout.write(`${box("Deploy complete", { preset: "success", title: "Status" })}\n`);
  process.stdout.write(`${callout("Check logs before shipping", "warning")}\n`);
  process.stdout.write(
    `${showTree(treeFromPaths(["src/index.ts", "docs/API.md", "package.json"]))}\n`,
  );
  process.stdout.write(`${highlightJson({ name: "scriptdx", version: "2.0.0" })}\n`);
}

export function runGradientLinksExample(): void {
  logSection("Gradient & Links", "Truecolor text and OSC 8 hyperlinks.");

  process.stdout.write(`${applyGradient("scriptdx", "ocean")}\n`);
  process.stdout.write(
    `${link("API docs", "https://github.com/whosramoss/scriptdx/blob/main/docs/API.md")}\n`,
  );
}
