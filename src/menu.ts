// -------------------------------------------------------
// Category    :: MENU
// Description :: Run a menu item by index.
// -------------------------------------------------------
import { ansi, styles } from "./colors.js";
import { logWarning } from "./logger.js";

export type MenuItem = {
  label: string;
  run: () => void | Promise<void>;
};

export async function runMenuByIndex(
  items: MenuItem[],
  selectedIndex: number,
): Promise<void> {
  const item = items[selectedIndex];
  if (!item) {
    logWarning("Invalid menu index.");
    return;
  }
  process.stdout.write(
    `\n\n${ansi(styles.brightWhite, `Selected: ${item.label}`)}\n\n`,
  );
  await item.run();
}
