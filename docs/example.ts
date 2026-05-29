import {
  color,
  debug,
  error,
  hasTool,
  info,
  isLinux,
  isWindows,
  simpleLoading,
  linearLoading,
  logColor,
  logError,
  logInfo,
  logQuestion,
  logSection,
  logSuccess,
  logTopic,
  logWarning,
  runMenuByIndex,
  runStep,
  showScriptTitle,
  showTable,
  showTableWithBorders,
  styles,
  success,
  summarizeToolValidation,
  warning,
} from "../src/index";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

function runLogsExample(): void {
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
  process.stdout.write(`${color.cyan("Cyan text")}\n`);
  process.stdout.write(
    `Available style keys: ${Object.keys(styles).join(", ")}\n`,
  );
}

function runTableExample(): void {
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
}

async function runStepExample(): Promise<void> {
  logSection(
    "Step Functions",
    "Run named steps with spinner feedback and success/failure result.",
  );

  const shouldRunSteps = true;
  if (!shouldRunSteps) {
    logWarning("Steps were skipped.");
    return;
  }

  await runStep(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }, "1. Waiting before creating a resource");

  await runStep(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }, "2. Creating the resource");

  await runStep(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }, "3. Deleting the resource");
}

function runValidationsExample(): void {
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

async function runLoadingExample(): Promise<void> {
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

function runSystemExample(): void {
  logSection("Extras", "Complementary examples for font and system helpers.");

  logTopic("System");
  process.stdout.write(`isLinux(): ${String(isLinux())}\n`);
  process.stdout.write(`isWindows(): ${String(isWindows())}\n`);
}

async function runMenuDemo(): Promise<void> {
  logSection(
    "Menu Functions",
    "Menu-like execution flow inspired by tutorial.sh main() options.",
  );

  const options = [
    "View System",
    "View Logs Functions",
    "View Table Functions",
    "View Step Functions",
    "View Validations Functions",
    "View Loading Functions",
  ];

  const actions = [
    runSystemExample,
    runLogsExample,
    runTableExample,
    runStepExample,
    runValidationsExample,
    runLoadingExample,
  ];

  const menuItems = options.map((label, index) => ({
    label,
    run: actions[index] ?? (() => {}),
  }));

  const rl = createInterface({ input, output });
  let keepRunning = true;

  while (keepRunning) {
    process.stdout.write("\nSelect an option:\n");
    for (let i = 0; i < options.length; i += 1) {
      process.stdout.write(`  ${i + 1}. ${options[i]}\n`);
    }
    process.stdout.write("  0. Exit menu\n");

    const answer = (await rl.question("Your choice: ")).trim();
    const selected = Number(answer);

    if (selected === 0) {
      keepRunning = false;
      break;
    }

    if (
      !Number.isInteger(selected) ||
      selected < 1 ||
      selected > menuItems.length
    ) {
      logWarning("Invalid option. Please choose a valid number.");
      continue;
    }

    await runMenuByIndex(menuItems, selected - 1);
    const proceed = (await rl.question("Run another option? (y/N): "))
      .trim()
      .toLowerCase();
    if (proceed !== "y" && proceed !== "yes") {
      keepRunning = false;
    }
  }
  rl.close();
}

async function main(): Promise<void> {
  process.stdout.write(`\n\n${showScriptTitle("SCRIPTDX")}\n`);

  logSection(
    "Scriptdx Tutorial",
    "TypeScript tutorial with options structure and flow.",
  );

  logQuestion("Please select an option (menu demo will run below).");

  await runMenuDemo();

  logSuccess("Tutorial finished successfully.");
}

main().catch((reason: unknown) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  logError(`Tutorial failed: ${message}`);
  process.exit(1);
});

