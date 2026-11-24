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

/** Outcome of {@link runStep}. `error` is present only when `ok` is `false`. */
export type StepResult =
  | { ok: true }
  | { ok: false; error: unknown };

/**
 * Run an async task with a Braille spinner on stderr.
 * The thrown value is returned on failure and is not rethrown.
 *
 * @param task - Async function to execute
 * @param message - Label shown during/after execution
 * @param options - Optional `stream`. Spinner defaults to `process.stderr`;
 *   success/error logs default to `process.stdout`. When `stream` is set, both
 *   the spinner and the final log use that stream.
 * @returns `{ ok: true }` when the task finishes, or `{ ok: false, error }` with the thrown value
 *
 * @example
 * ```ts
 * const result = await runStep(async () => {
 *   await deploy();
 * }, "Deploying to production");
 *
 * if (!result.ok) {
 *   console.error(result.error);
 * }
 * ```
 */
export async function runStep(
  task: () => Promise<void>,
  message: string,
  options?: OutputOptions,
): Promise<StepResult> {
  const spinnerStream = getOutputStream(options, process.stderr);
  const logOptions: OutputOptions = { stream: getOutputStream(options) };
  const spinner = createSpinner({ stream: spinnerStream });
  spinner.start(message);

  try {
    await task();
    spinner.stop();
    logSuccess(message, logOptions);
    return { ok: true };
  } catch (error: unknown) {
    spinner.stop();
    logError(message, logOptions);
    return { ok: false, error };
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
