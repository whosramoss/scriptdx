// -------------------------------------------------------
// Category    :: STEP
// Description :: Run async step with spinner.
// -------------------------------------------------------
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

// -------------------------------------------------------
// Category    :: STEP
// Description :: Backward-compatible spinner factory.
// -------------------------------------------------------
export type Spinner = {
  start(text?: string): void;
  stop(finalLine?: string): void;
};

export type SpinnerOptions = {
  intervalMs?: number;
  stream?: NodeJS.WriteStream;
};

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
