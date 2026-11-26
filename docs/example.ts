import { logError, logQuestion, logSection, logSuccess, logWarning, runMenuByIndex } from "../src/index";
import { showScriptTitle } from "../src/font/index";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  runDiffRetryExample,
  runFormatExample,
  runGradientLinksExample,
  runLayoutExample,
  runLoadingExample,
  runLogsExample,
  runStepExample,
  runSystemExample,
  runTableExample,
  runValidationsExample,
} from "./scenarios";

async function runMenuDemo(): Promise<void> {
  logSection(
    "Menu Functions",
    "Menu-like execution flow inspired by tutorial.sh main() options.",
  );

  const menuItems = [
    { label: "View System", run: runSystemExample },
    { label: "View Logs Functions", run: runLogsExample },
    { label: "View Table Functions", run: runTableExample },
    { label: "View Step Functions", run: runStepExample },
    { label: "View Validations Functions", run: runValidationsExample },
    { label: "View Loading Functions", run: runLoadingExample },
    { label: "View Format & ANSI", run: runFormatExample },
    { label: "View Diff & Retry", run: runDiffRetryExample },
    { label: "View Box, Tree & JSON", run: runLayoutExample },
    { label: "View Gradient & Links", run: runGradientLinksExample },
  ];

  const rl = createInterface({ input, output });
  let keepRunning = true;

  while (keepRunning) {
    process.stdout.write("\nSelect an option:\n");
    for (let i = 0; i < menuItems.length; i += 1) {
      process.stdout.write(`  ${i + 1}. ${menuItems[i]?.label ?? ""}\n`);
    }
    process.stdout.write("  0. Exit menu\n");

    const answer = (await rl.question("Your choice: ")).trim();
    const selected = Number(answer);

    if (selected === 0) {
      keepRunning = false;
      break;
    }

    if (!Number.isInteger(selected) || selected < 1 || selected > menuItems.length) {
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
