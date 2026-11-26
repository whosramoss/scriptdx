import { afterEach, describe, expect, it, vi } from "vitest";
import { applyGradient, gradient, gradientBanner } from "../src/gradient.js";
import { setColorEnabled } from "../src/colors.js";

describe("gradient", () => {
  afterEach(() => {
    setColorEnabled(true);
    vi.restoreAllMocks();
  });

  it("returns plain text when color is disabled and truecolor when it is enabled", () => {
    setColorEnabled(false);
    expect(gradient("Hello", ["cyan", "blue"])).toBe("Hello");

    setColorEnabled(true);
    const painted = applyGradient("Hi", "ocean");
    expect(painted).toContain("\u001b[38;2;");
    expect(painted.endsWith("\u001b[0m")).toBe(true);
  });

  it("draws a banner border around the plain text width", () => {
    setColorEnabled(false);
    expect(gradientBanner("Go", "mono", { padding: 1 })).toBe(
      ["┌────┐", "│ Go │", "└────┘"].join("\n"),
    );
  });
});
