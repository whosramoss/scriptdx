import { describe, expect, it } from "vitest";
import { retry, retryAsync, retryFixed, withRetry } from "../src/retry.js";

describe("retry", () => {
  it("returns the value after a failed attempt", async () => {
    let calls = 0;
    const result = await retry(
      () => {
        calls += 1;
        if (calls < 2) return Promise.reject(new Error("not yet"));
        return Promise.resolve("ok");
      },
      { maxAttempts: 3, initialDelay: 1, jitter: false, log: false },
    );

    expect(calls).toBe(2);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("ok");
      expect(result.attempts).toBe(2);
    }
  });

  it("stops when retryIf returns false", async () => {
    let calls = 0;
    const result = await retry(
      () => {
        calls += 1;
        return Promise.reject(new Error("fatal"));
      },
      { maxAttempts: 4, initialDelay: 1, jitter: false, retryIf: () => false },
    );

    expect(calls).toBe(1);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toHaveLength(1);
  });

  it("throws from retryAsync and keeps a fixed delay", async () => {
    await expect(retryAsync(() => Promise.reject(new Error("no")), { maxAttempts: 1 })).rejects.toThrow("no");

    const wrapped = withRetry((value: number) => {
      if (value < 0) return Promise.reject(new Error("negative"));
      return Promise.resolve(value);
    }, { maxAttempts: 1 });
    const success = await wrapped(2);
    expect(success.ok).toBe(true);

    const fixed = await retryFixed(() => Promise.resolve("done"), 1, { maxAttempts: 1, jitter: false });
    expect(fixed.ok).toBe(true);
  });

  it("returns an abort error when the signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const result = await retry(() => Promise.resolve("unused"), { signal: controller.signal, maxAttempts: 2 });
    expect(result.ok).toBe(false);
    if (!result.ok && result.error instanceof Error) expect(result.error.message).toBe("Aborted");
  });
});
