import { logError, logSuccess } from "./logger.js";
import { getOutputStream, type OutputOptions } from "./output.js";

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
 * @param options - Optional `stream`. Spinner defaults to `process.stderr`;
 *   success/error logs default to `process.stdout`. When `stream` is set, both
 *   the spinner and the final log use that stream.
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
  options?: OutputOptions,
): Promise<boolean> {
  let frame = 0;
  const spinnerStream = getOutputStream(options, process.stderr);
  const logOptions: OutputOptions = { stream: getOutputStream(options) };
  const timer = setInterval(() => {
    spinnerStream.write(
      `\r${SPINNER_FRAMES[frame % SPINNER_FRAMES.length]} ${message}`,
    );
    frame += 1;
  }, 80);

  try {
    await task();
    clearInterval(timer);
    spinnerStream.write("\r\x1b[K");
    logSuccess(message, logOptions);
    return true;
  } catch {
    clearInterval(timer);
    spinnerStream.write("\r\x1b[K");
    logError(message, logOptions);
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

/** Options for {@link createSpinner}. `stream` defaults to `process.stderr`. */
export type SpinnerOptions = OutputOptions & {
  /** Frame interval in milliseconds (default `80`). */
  intervalMs?: number;
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
  const stream = getOutputStream(options, process.stderr);
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
