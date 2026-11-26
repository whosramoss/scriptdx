/**
 * @category RETRY
 * @description Async retry with exponential backoff.
 */

import { logError, logSuccess, logWarning } from "./logger.js";

/** Configuration for {@link retry}. */
export type RetryOptions = {
  /** Maximum attempts (default `3`). */
  maxAttempts?: number;
  /** Delay before the second attempt, in ms (default `1000`). */
  initialDelay?: number;
  /** Upper bound for the delay, in ms (default `30000`). */
  maxDelay?: number;
  /** Multiplier applied after each failure (default `2`). */
  factor?: number;
  /** Randomize the delay (default `true`). */
  jitter?: boolean;
  /** Jitter amplitude as a fraction of the delay (default `0.1`). */
  jitterFactor?: number;
  /** Per-attempt timeout in ms. Omitted means no timeout. */
  timeout?: number;
  /** Return `false` to stop retrying this error. */
  retryIf?: (error: unknown, attempt: number) => boolean;
  /** Called before each wait. */
  onRetry?: (error: unknown, attempt: number, delay: number) => void;
  /** Write retry logs (default `false`). */
  log?: boolean;
  /** Cancel waiting and further attempts. */
  signal?: AbortSignal;
};

/** Success or the last failure, including every error seen. */
export type RetryResult<T> =
  | { ok: true; value: T; attempts: number; totalTime: number }
  | { ok: false; error: unknown; attempts: number; totalTime: number; errors: unknown[] };

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Aborted"));
      return;
    }
    const onAbort = (): void => {
      clearTimeout(timeout);
      reject(new Error("Aborted"));
    };
    const timeout = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

async function runAttempt<T>(fn: () => Promise<T>, timeout?: number): Promise<T> {
  const attempt = fn();
  void attempt.catch(() => undefined);
  if (!timeout) return attempt;

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      attempt,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`Timeout after ${timeout}ms`));
        }, timeout);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

function failure<T>(
  error: unknown,
  attempts: number,
  startedAt: number,
  errors: unknown[],
): RetryResult<T> {
  return { ok: false, error, attempts, totalTime: Date.now() - startedAt, errors };
}

/**
 * Retry an async operation with exponential backoff.
 * Failures are returned in the result. They are not thrown.
 *
 * @param fn - Operation to attempt
 * @param options - Attempts, delay, jitter, timeout, and abort signal
 * @returns The value or the last error with attempt metadata
 *
 * @example
 * ```ts
 * const result = await retry(async () => fetch(url), { maxAttempts: 3, jitter: false });
 * if (result.ok) console.log(result.value);
 * ```
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<RetryResult<T>> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30_000,
    factor = 2,
    jitter = true,
    jitterFactor = 0.1,
    timeout,
    retryIf,
    onRetry,
    log = false,
    signal,
  } = options;

  const startedAt = Date.now();
  const errors: unknown[] = [];
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt += 1;
    if (signal?.aborted) return failure(new Error("Aborted"), attempt, startedAt, errors);

    try {
      const value = await runAttempt(fn, timeout);
      if (log) logSuccess(`Succeeded on attempt ${attempt}`);
      return { ok: true, value, attempts: attempt, totalTime: Date.now() - startedAt };
    } catch (error: unknown) {
      errors.push(error);
      if (retryIf && !retryIf(error, attempt)) return failure(error, attempt, startedAt, errors);
      if (attempt >= maxAttempts) {
        if (log) logError(`Failed after ${attempt} attempts`);
        return failure(error, attempt, startedAt, errors);
      }

      let delay = Math.min(initialDelay * factor ** (attempt - 1), maxDelay);
      if (jitter) {
        const jitterAmount = delay * jitterFactor;
        delay += Math.random() * jitterAmount * 2 - jitterAmount;
      }
      delay = Math.max(0, delay);

      if (log) logWarning(`Attempt ${attempt} failed, retrying in ${Math.round(delay)}ms...`);
      onRetry?.(error, attempt, delay);

      try {
        await sleep(delay, signal);
      } catch (sleepError: unknown) {
        return failure(sleepError, attempt, startedAt, errors);
      }
    }
  }

  return failure(new Error("Max attempts reached"), attempt, startedAt, errors);
}

/**
 * Retry and throw the last error when every attempt fails.
 *
 * @param fn - Operation to attempt
 * @param options - Same options as {@link retry}
 * @returns The resolved value
 */
export async function retryAsync<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const result = await retry(fn, options);
  if (result.ok) return result.value;
  throw result.error;
}

/**
 * Wrap a function so each call is retried.
 *
 * @param fn - Async function to wrap
 * @param options - Default retry options
 * @returns A function with the same arguments and a {@link RetryResult}
 */
export function withRetry<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
  options: RetryOptions = {},
): (...args: Args) => Promise<RetryResult<Result>> {
  return (...args) => retry(() => fn(...args), options);
}

/**
 * Retry with a constant delay (`factor` forced to `1`).
 *
 * @param fn - Operation to attempt
 * @param options - Retry options except `factor`
 */
export async function retryLinear<T>(
  fn: () => Promise<T>,
  options: Omit<RetryOptions, "factor"> = {},
): Promise<RetryResult<T>> {
  return retry(fn, { ...options, factor: 1 });
}

/**
 * Retry with one fixed delay and no backoff.
 *
 * @param fn - Operation to attempt
 * @param delay - Delay between attempts, in ms
 * @param options - Retry options except `factor` and `initialDelay`
 */
export async function retryFixed<T>(
  fn: () => Promise<T>,
  delay: number,
  options: Omit<RetryOptions, "factor" | "initialDelay"> = {},
): Promise<RetryResult<T>> {
  return retry(fn, { ...options, initialDelay: delay, factor: 1 });
}
