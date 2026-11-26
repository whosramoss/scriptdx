import { afterEach, describe, expect, it } from "vitest";
import { setColorEnabled } from "../src/colors.js";
import { showTree, treeFromObject, treeFromPaths } from "../src/tree.js";

describe("tree", () => {
  afterEach(() => {
    setColorEnabled(true);
  });

  it("renders guides and builds nodes from paths and objects", () => {
    setColorEnabled(false);
    const fromPaths = showTree(
      treeFromPaths(["src/index.ts", "package.json"]),
    );
    expect(fromPaths).toBe(
      [".", "├── src", "│   └── index.ts", "└── package.json"].join("\n"),
    );

    const fromObject = showTree(treeFromObject({ name: "Ada" }, "pkg"));
    expect(fromObject).toBe(["pkg", "└── name (Ada)"].join("\n"));
  });

  it("stops at maxDepth and can use ASCII guides", () => {
    setColorEnabled(false);
    const tree = showTree(
      { name: "root", children: [{ name: "child", children: [{ name: "leaf" }] }] },
      { maxDepth: 1, ascii: true },
    );
    expect(tree).toContain("`-- child");
    expect(tree).not.toContain("leaf");
  });
});
