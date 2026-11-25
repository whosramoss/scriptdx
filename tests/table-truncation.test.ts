import { afterEach, describe, expect, it } from "vitest";
import { createTableBuilder, showTable } from "../src/table.js";
import { setColorEnabled } from "../src/colors.js";

afterEach(() => {
  setColorEnabled(true);
});

describe("showTable truncation", () => {
  it("truncates cells to maxWidth", () => {
    setColorEnabled(false);
    const table = showTable(["Name", "Description"], [["api", "This is a very long description"]], {
      columnWidth: "auto",
      maxWidth: 12,
      ellipsis: "...",
    });
    expect(table).toContain("This is a...");
    expect(table.split("\n")[2]?.length).toBe("Name".length + 1 + 12);
  });

  it("wraps a long cell onto extra lines", () => {
    const table = showTable(["Name", "Description"], [["api", "Long description that wraps"]], {
      columnWidth: "auto",
      maxWidth: 12,
      wrap: true,
    });
    const body = table.split("\n").slice(2);
    expect(body.length).toBeGreaterThan(1);
    expect(body[0]).toContain("Long");
    expect(body.join(" ")).toContain("wraps");
  });

  it("limits rows and styles the header", () => {
    const table = showTable(
      ["id", "status"],
      [["1", "ok"], ["2", "ok"], ["3", "ok"]],
      { maxRows: 1, headerStyle: "uppercase" },
    );
    expect(table.startsWith("ID")).toBe(true);
    expect(table).toContain("... and 2 more rows");
    expect(table).not.toContain("\n3");
  });

  it("accepts a width per column", () => {
    const table = showTable(["A", "B"], [["hello", "world"]], {
      columnWidth: [3, 5],
      maxWidth: 5,
      ellipsis: "…",
    });
    expect(table.split("\n")[2]).toBe("he… world");
  });
});

describe("createTableBuilder", () => {
  it("builds a compact table and a page footer", () => {
    const builder = createTableBuilder();
    const compact = builder.compact(["Name"], [["ok"]]);
    expect(compact.split("\n")[0]).toBe("Name");

    const rows = Array.from({ length: 3 }, (_, index) => [String(index + 1)]);
    const page = builder.paginated(["ID"], rows, 1, 2);
    expect(page).toContain("Page 2 of 2 (3 total rows)");
    expect(page).toContain("3");
    expect(page).not.toContain("\n1 ");
  });
});
