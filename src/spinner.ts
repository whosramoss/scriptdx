import { logError, logSuccess, logWarning } from "./logger.js";
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
  | { ok: true; durationMs: number }
  | { ok: false; error: unknown; durationMs: number };

/** Options for {@link runStep}. `stream` defaults to stderr for the spinner and stdout for the final log. */
export type RunStepOptions = OutputOptions & {
  /** Timeout in milliseconds. Omitted or `0` means no timeout. */
  timeoutMs?: number;
  /** Message shown on timeout. Default: `"{message} (timed out after {timeoutMs}ms)"`. */
  timeoutMessage?: string;
  /** Append a formatted duration to the success line. Default `false`. */
  showDuration?: boolean;
};

/** Thrown by {@link runStep} when `timeoutMs` elapses before the task settles. */
export class TimeoutError extends Error {
  constructor(
    message: string,
    public readonly timeoutMs: number,
  ) {
    super(message);
    this.name = "TimeoutError";
  }
}

type CancellableTimeout = {
  promise: Promise<never>;
  cancel: () => void;
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

function startTimeout(
  timeoutMs: number,
  message: string,
  timeoutMessage?: string,
): CancellableTimeout {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const promise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(
        new TimeoutError(
          timeoutMessage ?? `${message} (timed out after ${timeoutMs}ms)`,
          timeoutMs,
        ),
      );
    }, timeoutMs);
  });

  return {
    promise,
    cancel(): void {
      if (timer !== undefined) clearTimeout(timer);
    },
  };
}

async function invokeTask(task: () => Promise<void>): Promise<void> {
  return task();
}

function stopStep(
  spinner: Spinner,
  startedAt: number,
  timeout?: CancellableTimeout,
): number {
  timeout?.cancel();
  spinner.stop();
  return Date.now() - startedAt;
}

/**
 * Run an async task with a Braille spinner on stderr.
 * The thrown value is returned on failure and is not rethrown.
 * A timeout resolves as `{ ok: false, error: TimeoutError }` and logs a warning.
 *
 * @param task - Async function to execute
 * @param message - Label shown during/after execution
 * @param options - Timeout, duration display, and `stream`. Spinner defaults to
 *   `process.stderr`; success/error logs default to `process.stdout`. When
 *   `stream` is set, both the spinner and the final log use that stream.
 * @returns Result with `ok`, `durationMs`, and `error` when the task fails
 *
 * @example
 * ```ts
 * const result = await runStep(async () => {
 *   await fetchData();
 * }, "Fetching data", { timeoutMs: 5000 });
 *
 * if (!result.ok && result.error instanceof TimeoutError) {
 *   console.error(result.error.message);
 * }
 * ```
 */
export async function runStep(
  task: () => Promise<void>,
  message: string,
  options: RunStepOptions = {},
): Promise<StepResult> {
  const { timeoutMs, timeoutMessage, showDuration = false } = options;
  if (timeoutMs !== undefined && timeoutMs < 0) {
    throw new RangeError("timeoutMs must be non-negative");
  }

  const spinnerStream = getOutputStream(options, process.stderr);
  const logOptions: OutputOptions = { stream: getOutputStream(options) };
  const spinner = createSpinner({ stream: spinnerStream });
  const startedAt = Date.now();
  spinner.start(message);

  const timeout = timeoutMs ? startTimeout(timeoutMs, message, timeoutMessage) : undefined;
  const taskPromise = invokeTask(task);
  void taskPromise.catch(() => undefined);

  try {
    await (timeout ? Promise.race([taskPromise, timeout.promise]) : taskPromise);
    const durationMs = stopStep(spinner, startedAt, timeout);
    const successMessage = showDuration ? `${message} (${formatDuration(durationMs)})` : message;
    logSuccess(successMessage, logOptions);
    return { ok: true, durationMs };
  } catch (error: unknown) {
    const durationMs = stopStep(spinner, startedAt, timeout);
    if (error instanceof TimeoutError) logWarning(error.message, logOptions);
    else logError(message, logOptions);
    return { ok: false, error, durationMs };
  }
}

/**
 * Run {@link runStep} and return only the boolean status.
 *
 * @param task - Async function to execute
 * @param message - Label shown during/after execution
 * @param options - Same options as {@link runStep}
 * @returns `true` when the task finishes, `false` when it fails or times out
 *
 * @example
 * ```ts
 * const ok = await runStepLegacy(async () => {
 *   await deploy();
 * }, "Deploying");
 * ```
 */
export async function runStepLegacy(
  task: () => Promise<void>,
  message: string,
  options?: RunStepOptions,
): Promise<boolean> {
  const result = await runStep(task, message, options);
  return result.ok;
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
