import { afterEach, describe, expect, it } from "vitest";
import { setColorEnabled } from "../src/colors.js";
import { compactJson, highlightJson, parseJsonSafe } from "../src/json.js";

describe("json highlight", () => {
  afterEach(() => {
    setColorEnabled(true);
  });

  it("pretty-prints and compacts values", () => {
    setColorEnabled(false);
    expect(highlightJson({ name: "Ada", ok: true })).toBe(
      ['{', '  "name": "Ada",', '  "ok": true', '}'].join("\n"),
    );
    expect(compactJson([1, null])).toBe("[1, null]");
  });

  it("truncates arrays and parses safely", () => {
    setColorEnabled(false);
    expect(highlightJson([1, 2, 3], { maxArrayItems: 1 })).toContain("2 more items");

    const parsed = parseJsonSafe('{"ok":true}');
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.value).toEqual({ ok: true });

    const invalid = parseJsonSafe("{");
    expect(invalid.ok).toBe(false);
  });
});
