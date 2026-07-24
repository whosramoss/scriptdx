import { logError, logSuccess } from "./logger.js";

const SPINNER_FRAMES = [
  "⠋",
  "⠙",
  "⠹",
  "⠸",
  "⠼",
  "⠴",
  "⠦",
  "⠧",
  "⠇",
  "⠏",
] as const;

/**
 * Run an async task with a Braille spinner on stderr.
 * Returns `true` on success, `false` on failure.
 *
 * @param task - Async function to execute
 * @param message - Label shown during/after execution
 * @returns Whether the task completed without throwing
 *
 * @example
 * ```ts
 * const ok = await runStep(async () => {
 *   await deploy();
 * }, "Deploying to production");
 * ```
 */
export async function runStep(
  task: () => Promise<void>,
  message: string,
): Promise<boolean> {
  let frame = 0;
  const timer = setInterval(() => {
    process.stderr.write(
      `\r${SPINNER_FRAMES[frame % SPINNER_FRAMES.length]} ${message}`,
    );
    frame += 1;
  }, 80);

  try {
    await task();
    clearInterval(timer);
    process.stderr.write("\r\x1b[K");
    logSuccess(message);
    return true;
  } catch {
    clearInterval(timer);
    process.stderr.write("\r\x1b[K");
    logError(message);
    return false;
  }
}

/**
 * @category STEP
 * @description Backward-compatible spinner factory.
 */

/** Manual spinner handle returned by {@link createSpinner}. */
export type Spinner = {
  /** Begin the animation; optional `text` is shown beside the frames. */
  start(text?: string): void;
  /** Stop the animation; optionally write `finalLine` with a newline. */
  stop(finalLine?: string): void;
};

/** Options for {@link createSpinner}. */
export type SpinnerOptions = {
  /** Frame interval in milliseconds (default `80`). */
  intervalMs?: number;
  /** Output stream (default `process.stderr`). */
  stream?: NodeJS.WriteStream;
};

/**
 * Create a manually controlled Braille spinner.
 *
 * @param options - Interval and stream overrides
 * @returns Spinner with `start` / `stop` methods
 *
 * @example
 * ```ts
 * const spinner = createSpinner();
 * spinner.start("Fetching...");
 * // ... work ...
 * spinner.stop("Done");
 * ```
 */
export function createSpinner(options: SpinnerOptions = {}): Spinner {
  const intervalMs = options.intervalMs ?? 80;
  const stream = options.stream ?? process.stderr;
  let timer: ReturnType<typeof setInterval> | undefined;
  let frame = 0;
  let label = "";

  const tick = (): void => {
    const f = SPINNER_FRAMES[frame % SPINNER_FRAMES.length] ?? "";
    stream.write(`\r${f} ${label}`);
    frame += 1;
  };

  return {
    start(text = ""): void {
      if (timer !== undefined) {
        return;
      }
      label = text;
      timer = setInterval(tick, intervalMs);
      tick();
    },
    stop(finalLine?: string): void {
      if (timer !== undefined) {
        clearInterval(timer);
        timer = undefined;
      }
      stream.write("\r\x1b[K");
      if (finalLine !== undefined) {
        stream.write(`${finalLine}\n`);
      }
    },
  };
}
