import { afterEach, describe, expect, it, vi } from "vitest";
import { createSpinner, runStep } from "../src/spinner.js";
import { getSpinnerFrames, spinnerPresets } from "../src/spinner-frames.js";
import { setColorEnabled } from "../src/colors.js";

function mockStream(target: string[]): NodeJS.WriteStream {
  return {
    write: (chunk: string | Uint8Array): boolean => {
      target.push(String(chunk));
      return true;
    },
  } as NodeJS.WriteStream;
}

describe("spinner frames", () => {
  afterEach(() => {
    vi.useRealTimers();
    setColorEnabled(true);
  });

  it("resolves presets and custom frames", () => {
    expect(getSpinnerFrames("line")).toEqual(spinnerPresets.line);
    vi.useFakeTimers();
    const chunks: string[] = [];
    const spinner = createSpinner({ stream: mockStream(chunks), frames: "arrow", intervalMs: 10 });
    spinner.start("go");
    expect(chunks[0]).toContain("←");
    spinner.stop();
  });

  it("colors frames and passes them through runStep", async () => {
    setColorEnabled(true);
    vi.useFakeTimers();
    const chunks: string[] = [];
    const spinner = createSpinner({
      stream: mockStream(chunks),
      frames: ["A", "B"],
      color: "lightCyan",
      intervalMs: 10,
    });
    spinner.start("paint");
    expect(chunks[0]).toContain("\u001b[");
    spinner.stop();

    const logs: string[] = [];
    const logStream = mockStream(logs);
    const pending = runStep(() => Promise.resolve(), "step", {
      stream: logStream,
      spinnerFrames: ["X"],
    });
    await vi.runAllTimersAsync();
    const result = await pending;
    expect(result.ok).toBe(true);
    expect(logs.some((chunk) => chunk.includes("X"))).toBe(true);
  });
});
