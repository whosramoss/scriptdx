import { afterEach, describe, expect, it } from "vitest";
import { box, callout, separator } from "../src/box.js";
import { setColorEnabled } from "../src/colors.js";
import { stripAnsi } from "../src/ansi-utils.js";

describe("box", () => {
  afterEach(() => {
    setColorEnabled(true);
  });

  it("draws a single border around the text", () => {
    setColorEnabled(false);
    expect(box("Hello World")).toBe(
      ["┌─────────────┐", "│ Hello World │", "└─────────────┘"].join("\n"),
    );
  });

  it("uses the preset icon and a separator", () => {
    setColorEnabled(false);
    expect(callout("Careful", "warning")).toContain("⚠  Careful");
    expect(callout("Careful", "warning").startsWith("╭")).toBe(true);
    expect(stripAnsi(separator({ width: 3, char: "-" }))).toBe("---");
  });
});
