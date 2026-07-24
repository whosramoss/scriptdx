// -------------------------------------------------------
// Category    :: LOADING
// Description :: Simple loading animations.
// -------------------------------------------------------
const LOADING_FRAMES = ["|", "/", "-", "\\"] as const;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
