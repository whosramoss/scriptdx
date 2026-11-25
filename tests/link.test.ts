import { afterEach, describe, expect, it } from "vitest";
import { setColorEnabled } from "../src/colors.js";
import { breadcrumb, link, linkify, supportsHyperlinks } from "../src/link.js";

const ENV_KEYS = ["TERM_PROGRAM", "WT_SESSION", "KONSOLE_VERSION", "COLORTERM"] as const;
const saved = new Map<string, string | undefined>();

function hideHyperlinkEnv(): void {
  for (const key of ENV_KEYS) {
    if (!saved.has(key)) saved.set(key, process.env[key]);
    delete process.env[key];
  }
}

afterEach(() => {
  setColorEnabled(true);
  for (const [key, value] of saved) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  saved.clear();
});

describe("terminal links", () => {
  it("falls back to text plus URL when OSC 8 is unavailable", () => {
    hideHyperlinkEnv();
    setColorEnabled(false);
    expect(supportsHyperlinks()).toBe(false);
    expect(link("Docs", "https://example.com", { underline: false })).toBe(
      "Docs (https://example.com)",
    );
    expect(linkify("See https://example.com.", { underline: false, fallback: "url" })).toBe(
      "See https://example.com.",
    );
  });

  it("emits an OSC 8 sequence when the terminal is recognized", () => {
    hideHyperlinkEnv();
    process.env.TERM_PROGRAM = "vscode";
    setColorEnabled(false);
    expect(supportsHyperlinks()).toBe(true);
    const value = link("Docs", "https://example.com", { underline: false, id: "docs" });
    expect(value).toContain("\u001b]8;id=docs;https://example.com\u001b\\");
    expect(value).toContain("Docs");
    expect(breadcrumb([["Home", "https://example.com"]], " > ", { underline: false })).toContain("Home");
  });
});
