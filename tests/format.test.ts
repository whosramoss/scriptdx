import { describe, expect, it } from "vitest";
import {
  formatBytes,
  formatDuration,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from "../src/format.js";

describe("humanize formatters", () => {
  it("formats decimal and binary byte sizes", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1536)).toBe("1.54 KB");
    expect(formatBytes(1536, { binary: true })).toBe("1.5 KiB");
    expect(formatBytes(Number.NaN)).toBe("Invalid");
  });

  it("abbreviates numbers and leaves small values intact", () => {
    expect(formatNumber(1234)).toBe("1.2K");
    expect(formatNumber(1_234_567)).toBe("1.2M");
    expect(formatNumber(12)).toBe("12");
    expect(formatNumber(-1500)).toBe("-1.5K");
  });

  it("formats durations, percents, and relative time", () => {
    expect(formatDuration(90_000)).toBe("1 minute, 30 seconds");
    expect(formatDuration(90_000, { compact: true })).toBe("1m 30s");
    expect(formatDuration(1500)).toBe("1 second");
    expect(formatPercent(0.755)).toBe("75.5%");
    expect(formatPercent(75.5, { isRatio: false })).toBe("75.5%");
    const now = 1_700_000_000_000;
    expect(formatRelativeTime(now - 60_000, { now })).toBe("1 minute ago");
    expect(formatRelativeTime(now + 3_600_000, { now })).toBe("in 1 hour");
    expect(formatRelativeTime(now, { now })).toBe("just now");
  });
});
