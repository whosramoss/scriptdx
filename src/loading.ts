import { getOutputStream, type OutputOptions } from "./output.js";

const LOADING_FRAMES = ["|", "/", "-", "\\"] as const;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Cycle classic spinner frames (`| / - \\`) on a stream.
 *
 * @param repeat - Number of full cycles (default `2`). If `<= 0`, loops until interrupted
 * @param delayMs - Delay between frames in milliseconds (default `80`)
 * @param options - Optional `stream` (default `process.stdout`)
 *
 * @example
 * ```ts
 * await simpleLoading(3, 60);
 * ```
 */
export async function simpleLoading(
  repeat = 2,
  delayMs = 80,
  options?: OutputOptions,
): Promise<void> {
  if (delayMs < 0) throw new RangeError("delayMs must be non-negative");
  const stream = getOutputStream(options);
  let cycle = 0;
  while (repeat <= 0 || cycle < repeat) {
    for (const frame of LOADING_FRAMES) {
      stream.write(`\r\x1b[K${frame}`);
      await sleep(delayMs);
    }
    cycle += 1;
  }
  stream.write("\n");
}

/**
 * Animate `text` by rotating its characters as a loading line.
 *
 * @param text - Characters to rotate
 * @param repeat - Number of full cycles (default `2`). If `<= 0`, loops until interrupted
 * @param delayMs - Delay between frames in milliseconds (default `80`)
 * @param options - Optional `stream` (default `process.stdout`)
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
  options?: OutputOptions,
): Promise<void> {
  if (delayMs < 0) throw new RangeError("delayMs must be non-negative");
  const stream = getOutputStream(options);
  stream.write("\n");
  const chars = Array.from(text);
  if (chars.length === 0) {
    stream.write("\n");
    return;
  }

  let cycle = 0;
  while (repeat <= 0 || cycle < repeat) {
    for (let offset = 0; offset < chars.length; offset += 1) {
      const frame =
        chars.slice(offset).join("") + chars.slice(0, offset).join("");
      stream.write(`\r\x1b[K${frame}`);
      await sleep(delayMs);
    }
    cycle += 1;
  }
  stream.write("\n");
}
