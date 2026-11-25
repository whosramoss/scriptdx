import { describe, expect, it } from "vitest";
import {
  center,
  color,
  hasAnsi,
  padEnd,
  padStart,
  setColorEnabled,
  stringWidth,
  stripAnsi,
  truncate,
  wrapText,
} from "../src/index.js";

describe("ansi string utilities", () => {
  it("strips and detects ANSI codes", () => {
    setColorEnabled(true);
    const colored = color.red("ERROR");

    expect(stripAnsi(colored)).toBe("ERROR");
    expect(hasAnsi(colored)).toBe(true);
    expect(hasAnsi(colored)).toBe(true);
    expect(hasAnsi("plain")).toBe(false);
    expect(stringWidth(colored)).toBe(5);
    expect(stringWidth("hello")).toBe(5);
  });

  it("pads and centers by visible width", () => {
    setColorEnabled(true);
    const colored = color.red("OK");

    expect(stringWidth(padEnd(colored, 10))).toBe(10);
    expect(stripAnsi(padEnd(colored, 10))).toBe("OK        ");
    expect(hasAnsi(padEnd(colored, 10))).toBe(true);
    expect(stripAnsi(padStart(color.red("5"), 3))).toBe("  5");
    expect(stripAnsi(center(color.green("OK"), 10))).toBe("    OK    ");
    expect(padEnd("OK", 2)).toBe("OK");
  });

  it("truncates to the visible width", () => {
    setColorEnabled(true);

    expect(truncate(color.red("Hello World"), 8)).toBe("Hello W…");
    expect(truncate("This is a very long message", 15)).toBe("This is a very…");
    expect(truncate("short", 10)).toBe("short");
    expect(truncate("Hello", 1)).toBe("…");
  });

  it("wraps text on whitespace", () => {
    expect(wrapText("Hello World, this is a test", 10)).toEqual([
      "Hello",
      "World,",
      "this is a",
      "test",
    ]);
  });
});
