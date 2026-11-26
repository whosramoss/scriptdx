import { afterEach, describe, expect, it, vi } from "vitest";
import { setColorEnabled } from "../src/colors.js";

afterEach(() => {
  setColorEnabled(true);
  vi.resetModules();
});

describe("title fonts", () => {
  it("lists fonts and renders the banner without the standard glyph map", async () => {
    vi.resetModules();
    const font = await import("../src/font/index.js");
    const glyphs = await import("../src/font/glyphs.js");

    expect(font.getAvailableFonts()).toEqual(["standard", "banner", "slant"]);
    expect(glyphs.isFontMapAllocated()).toBe(false);

    const banner = font.showScriptTitle("A", { font: "banner" });
    expect(banner.split("\n")).toHaveLength(5);
    expect(glyphs.isFontMapAllocated()).toBe(false);
    expect(banner).toContain(".##.");
  });

  it("applies color, alignment, and a border", async () => {
    const colors = await import("../src/colors.js");
    const { showScriptTitle } = await import("../src/font/index.js");
    colors.setColorEnabled(true);
    const colored = showScriptTitle("A", { font: "banner", color: "lightCyan", border: true, align: "right" });
    expect(colored).toContain("┌");
    expect(colored).toContain("\u001b[");
  });
});
