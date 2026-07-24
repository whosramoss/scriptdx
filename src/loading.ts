const LOADING_FRAMES = ["|", "/", "-", "\\"] as const;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Cycle classic spinner frames (`| / - \\`) on stdout.
 *
 * @param repeat - Number of full cycles (default `2`). If `<= 0`, loops until interrupted
 * @param delayMs - Delay between frames in milliseconds (default `80`)
 *
 * @example
 * ```ts
 * await simpleLoading(3, 60);
 * ```
 */
export async function simpleLoading(repeat = 2, delayMs = 80): Promise<void> {
  if (delayMs < 0) throw new RangeError("delayMs must be non-negative");
  let cycle = 0;
  while (repeat <= 0 || cycle < repeat) {
    for (const frame of LOADING_FRAMES) {
      process.stdout.write(`\r\x1b[K${frame}`);
      await sleep(delayMs);
    }
    cycle += 1;
  }
  process.stdout.write("\n");
}

/**
 * Animate `text` by rotating its characters as a loading line on stdout.
 *
 * @param text - Characters to rotate
 * @param repeat - Number of full cycles (default `2`). If `<= 0`, loops until interrupted
 * @param delayMs - Delay between frames in milliseconds (default `80`)
 *
 * @example
 * ```ts
 * await linearLoading("Loading...", 2, 80);
 * ```
 */
export async function linearLoading(
  text: string,
  repeat = 2,
  delayMs = 80,
): Promise<void> {
  if (delayMs < 0) throw new RangeError("delayMs must be non-negative");
  process.stdout.write("\n");
  const chars = Array.from(text);
  if (chars.length === 0) {
    process.stdout.write("\n");
    return;
  }

  let cycle = 0;
  while (repeat <= 0 || cycle < repeat) {
    for (let offset = 0; offset < chars.length; offset += 1) {
      const frame =
        chars.slice(offset).join("") + chars.slice(0, offset).join("");
      process.stdout.write(`\r\x1b[K${frame}`);
      await sleep(delayMs);
    }
    cycle += 1;
  }
  process.stdout.write("\n");
}
