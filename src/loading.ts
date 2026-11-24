import { getOutputStream, type OutputOptions } from "./output.js";

const LOADING_FRAMES = ["|", "/", "-", "\\"] as const;

/** Shared options for loading animations. Positional calls stay valid. */
export type LoadingOptions = OutputOptions & {
  /** Full animation cycles. `<= 0` runs until `signal` aborts. Default `2`. */
  repeat?: number;
  /** Delay between frames in milliseconds. Default `80`. */
  delayMs?: number;
  /** Stops the animation when aborted. The returned promise resolves. */
  signal?: AbortSignal;
};

/** Options for {@link linearLoading} when the text travels in the same object. */
export type LinearLoadingOptions = LoadingOptions & {
  /** Characters to rotate. */
  text: string;
};

type LoadingCall = {
  repeat: number;
  delayMs: number;
  signal?: AbortSignal;
  stream?: NodeJS.WritableStream;
};

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.resolve();

  return new Promise((resolve) => {
    let settled = false;
    const finish = (): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", finish);
      resolve();
    };
    const timer = setTimeout(finish, ms);
    signal?.addEventListener("abort", finish);
  });
}

function assertDelay(delayMs: number): void {
  if (delayMs < 0) throw new RangeError("delayMs must be non-negative");
}

function isOptions(value: unknown): value is LoadingOptions {
  return typeof value === "object" && value !== null;
}

function fromPositional(
  repeat: number | undefined,
  delayMs: number | undefined,
  options?: OutputOptions & { signal?: AbortSignal },
): LoadingCall {
  return {
    repeat: repeat ?? 2,
    delayMs: delayMs ?? 80,
    signal: options?.signal,
    stream: options?.stream,
  };
}

async function playFrames(
  frames: readonly string[],
  call: LoadingCall,
): Promise<void> {
  assertDelay(call.delayMs);
  const stream = getOutputStream(call);
  let cycle = 0;

  while (call.repeat <= 0 || cycle < call.repeat) {
    if (call.signal?.aborted) break;

    for (const frame of frames) {
      if (call.signal?.aborted) break;
      stream.write(`\r\x1b[K${frame}`);
      await sleep(call.delayMs, call.signal);
      if (call.signal?.aborted) break;
    }

    if (call.signal?.aborted) break;
    cycle += 1;
  }

  stream.write("\r\x1b[K");
}

/**
 * Cycle classic spinner frames (`| / - \\`) on a stream.
 * `repeat <= 0` runs until `signal` aborts. The line is cleared when the
 * animation stops. Abort resolves the promise and does not throw.
 *
 * @param repeatOrOptions - Cycle count, or a {@link LoadingOptions} object
 * @param delayMs - Delay between frames when `repeatOrOptions` is a number
 * @param options - Optional `stream` and `signal` for the positional form
 *
 * @example
 * ```ts
 * await simpleLoading(2, 80);
 *
 * const controller = new AbortController();
 * setTimeout(() => controller.abort(), 5000);
 * await simpleLoading({ repeat: 0, signal: controller.signal });
 * ```
 */
export async function simpleLoading(options?: LoadingOptions): Promise<void>;
export async function simpleLoading(
  repeat?: number,
  delayMs?: number,
  options?: OutputOptions & { signal?: AbortSignal },
): Promise<void>;
export async function simpleLoading(
  repeatOrOptions?: number | LoadingOptions,
  delayMs?: number,
  options?: OutputOptions & { signal?: AbortSignal },
): Promise<void> {
  const call = isOptions(repeatOrOptions)
    ? fromPositional(repeatOrOptions.repeat, repeatOrOptions.delayMs, repeatOrOptions)
    : fromPositional(repeatOrOptions, delayMs, options);

  await playFrames(LOADING_FRAMES, call);
}

function framesFor(text: string): string[] {
  const chars = Array.from(text);
  return chars.map((_, offset) => chars.slice(offset).join("") + chars.slice(0, offset).join(""));
}

/**
 * Animate `text` by rotating its characters as a loading line.
 * `repeat <= 0` runs until `signal` aborts. The animation line is cleared
 * when the function returns. Abort resolves the promise and does not throw.
 *
 * @param textOrOptions - Text to rotate, or {@link LinearLoadingOptions}
 * @param repeatOrOptions - Cycle count, or {@link LoadingOptions} when `text` is positional
 * @param delayMs - Delay between frames for the positional form
 * @param options - Optional `stream` and `signal` for the positional form
 *
 * @example
 * ```ts
 * await linearLoading("Loading...", 2, 80);
 *
 * const controller = new AbortController();
 * const pending = linearLoading({
 *   text: "Loading...",
 *   repeat: 0,
 *   signal: controller.signal,
 * });
 * controller.abort();
 * await pending;
 * ```
 */
export async function linearLoading(
  text: string,
  repeat?: number,
  delayMs?: number,
  options?: OutputOptions & { signal?: AbortSignal },
): Promise<void>;
export async function linearLoading(text: string, options?: LoadingOptions): Promise<void>;
export async function linearLoading(options: LinearLoadingOptions): Promise<void>;
export async function linearLoading(
  textOrOptions: string | LinearLoadingOptions,
  repeatOrOptions?: number | LoadingOptions,
  delayMs?: number,
  options?: OutputOptions & { signal?: AbortSignal },
): Promise<void> {
  const text = typeof textOrOptions === "string" ? textOrOptions : textOrOptions.text;
  const call =
    typeof textOrOptions === "string"
      ? isOptions(repeatOrOptions)
        ? fromPositional(repeatOrOptions.repeat, repeatOrOptions.delayMs, repeatOrOptions)
        : fromPositional(repeatOrOptions, delayMs, options)
      : fromPositional(textOrOptions.repeat, textOrOptions.delayMs, textOrOptions);

  assertDelay(call.delayMs);
  const stream = getOutputStream(call);
  stream.write("\n");

  const frames = framesFor(text);
  if (frames.length === 0) {
    stream.write("\n");
    return;
  }

  await playFrames(frames, call);
}
