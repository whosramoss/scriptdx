import { ansi, styles } from "./colors.js";
import { logWarning } from "./logger.js";
import { getOutputStream, type OutputOptions } from "./output.js";

/** A labeled action that can be selected by index in a CLI menu. */
export type MenuItem = {
  /** Display label printed when the item is selected. */
  label: string;
  /** Sync or async handler invoked for this item. */
  run: () => void | Promise<void>;
};

/**
 * Run the menu item at `selectedIndex`.
 * Logs a warning and returns early if the index is invalid.
 *
 * @param items - Menu entries with labels and handlers
 * @param selectedIndex - Zero-based index of the item to run
 * @param options - Optional `stream` (default `process.stdout`)
 *
 * @example
 * ```ts
 * await runMenuByIndex(
 *   [
 *     { label: "Build", run: () => console.log("building") },
 *     { label: "Deploy", run: async () => { await deploy(); } },
 *   ],
 *   0,
 * );
 * ```
 */
export async function runMenuByIndex(
  items: MenuItem[],
  selectedIndex: number,
  options?: OutputOptions,
): Promise<void> {
  if (
    !Number.isInteger(selectedIndex) ||
    selectedIndex < 0 ||
    selectedIndex >= items.length
  ) {
    logWarning("Invalid menu index.", options);
    return;
  }
  const item = items[selectedIndex]!;
  getOutputStream(options).write(
    `\n\n${ansi(styles.brightWhite, `Selected: ${item.label}`)}\n\n`,
  );
  await item.run();
}
