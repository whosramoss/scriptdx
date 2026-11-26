import { describe, expect, it } from "vitest";
import { diff, formatDiff, inlineDiff, showDiff } from "../src/diff.js";
import { setColorEnabled } from "../src/colors.js";

describe("diff", () => {
  it("counts added and removed lines", () => {
    const result = diff("a\nb\nc", "a\nx\nc");
    expect(result.hasChanges).toBe(true);
    expect(result.additions).toBe(1);
    expect(result.deletions).toBe(1);
    expect(result.lines.map((line) => line.type)).toEqual(["same", "remove", "add", "same"]);
  });

  it("formats a plain diff and reports identical text", () => {
    setColorEnabled(false);
    expect(formatDiff(diff("same", "same"))).toBe("No changes");
    const formatted = formatDiff(diff("old", "new"), { context: 0 });
    expect(formatted).toContain("- old");
    expect(formatted).toContain("+ new");
    setColorEnabled(true);
  });

  it("writes a unified header to the given stream", () => {
    setColorEnabled(false);
    let output = "";
    const stream = {
      write(chunk: string | Uint8Array): boolean {
        output += String(chunk);
        return true;
      },
    } as NodeJS.WriteStream;
    showDiff("a", "b", { stream, header: "simple" });
    expect(output).toContain("1 additions, 1 deletions");
    expect(output).toContain("+ b");
    setColorEnabled(true);
  });

  it("highlights the changed middle of a line", () => {
    setColorEnabled(false);
    expect(inlineDiff("hello world", "hello there")).toBe("hello there (was: world)");
    expect(inlineDiff("same", "same")).toBe("same");
    setColorEnabled(true);
  });
});
