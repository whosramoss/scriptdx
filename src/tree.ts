/**
 * @category TREE
 * @description Hierarchical tree rendering.
 */

import { ansi, styles, type LoggerColor } from "./colors.js";

/** One node in a {@link showTree} graph. */
export type TreeNode = {
  name: string;
  children?: TreeNode[];
  /** Icon drawn before the name. */
  icon?: string;
  /** Color for the name. */
  color?: LoggerColor;
  /** Extra text after the name. */
  info?: string;
  /** Reserved for interactive trees. */
  expanded?: boolean;
};

/** Display options for {@link showTree}. */
export type TreeOptions = {
  /** Prefix before the root line. */
  rootPrefix?: string;
  /** Draw the root node (default `true`). */
  showRoot?: boolean;
  /** Width of each indent level (default `4`). */
  indent?: number;
  /** Use ASCII connectors instead of box-drawing characters. */
  ascii?: boolean;
  /** Deepest level to render. `0` is the root. */
  maxDepth?: number;
  /** Color of the guide lines. */
  lineColor?: LoggerColor;
  /** Color of nodes that have children. */
  folderColor?: LoggerColor;
  /** Color of nodes without children. */
  fileColor?: LoggerColor;
  /** Default icon for nodes with children. */
  folderIcon?: string;
  /** Default icon for nodes without children. */
  fileIcon?: string;
  /** Color the guide lines (default `true`). */
  guideLines?: boolean;
};

type TreeChars = { branch: string; lastBranch: string; vertical: string; empty: string };

function treeChars(ascii: boolean, indent: number): TreeChars {
  const spaces = " ".repeat(Math.max(1, indent));
  if (ascii) {
    return { branch: "|-- ", lastBranch: "`-- ", vertical: `|${spaces.slice(1)}`, empty: spaces };
  }
  return { branch: "├── ", lastBranch: "└── ", vertical: `│${spaces.slice(1)}`, empty: spaces };
}

/**
 * Render a tree as a multi-line string.
 *
 * @param node - Root node
 * @param options - Guides, colors, depth, and ASCII mode
 * @returns Formatted tree
 *
 * @example
 * ```ts
 * console.log(showTree({
 *   name: "src",
 *   children: [{ name: "index.ts" }],
 * }));
 * ```
 */
export function showTree(node: TreeNode, options: TreeOptions = {}): string {
  const {
    rootPrefix = "",
    showRoot = true,
    indent = 4,
    ascii = false,
    maxDepth,
    lineColor = "darkGray",
    folderColor = "lightCyan",
    fileColor = "white",
    folderIcon,
    fileIcon,
    guideLines = true,
  } = options;

  const chars = treeChars(ascii, indent);
  const lines: string[] = [];

  const paintGuide = (value: string): string => (guideLines ? ansi(styles[lineColor], value) : value);

  const renderNode = (current: TreeNode, prefix: string, isLast: boolean, depth: number): void => {
    if (maxDepth !== undefined && depth > maxDepth) return;

    const hasChildren = (current.children?.length ?? 0) > 0;
    const icon = current.icon ?? (hasChildren ? folderIcon : fileIcon) ?? "";
    const color = current.color ?? (hasChildren ? folderColor : fileColor);
    const name = icon ? `${icon} ${current.name}` : current.name;
    const info = current.info ? ansi(styles.darkGray, ` (${current.info})`) : "";
    const label = ansi(styles[color], name) + info;

    if (depth === 0 && showRoot) lines.push(rootPrefix + label);
    else if (depth > 0) {
      lines.push(prefix + paintGuide(isLast ? chars.lastBranch : chars.branch) + label);
    }

    current.children?.forEach((child, index, children) => {
    const childIsLast = index === children.length - 1;
    const nextPrefix =
      depth === 0 ? prefix : prefix + paintGuide(isLast ? chars.empty : chars.vertical);
    renderNode(child, nextPrefix, childIsLast, depth + 1);
    });
  };

  renderNode(node, "", true, 0);
  return lines.join("\n");
}

function sortTree(node: TreeNode): void {
  if (!node.children) return;
  node.children.sort((a, b) => {
    const aFolder = a.children !== undefined;
    const bFolder = b.children !== undefined;
    if (aFolder !== bFolder) return aFolder ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  node.children.forEach(sortTree);
}

/**
 * Build a tree from path strings.
 *
 * @param paths - File paths
 * @param options - Separator and root label
 * @returns A root node whose children are the path segments
 *
 * @example
 * ```ts
 * showTree(treeFromPaths(["src/index.ts", "package.json"]));
 * ```
 */
export function treeFromPaths(
  paths: string[],
  options: { separator?: string; rootName?: string } = {},
): TreeNode {
  const { separator = "/", rootName = "." } = options;
  const root: TreeNode = { name: rootName, children: [] };

  for (const path of paths) {
    const parts = path.split(separator).filter((part) => part.length > 0);
    let current = root;
    for (let index = 0; index < parts.length; index += 1) {
      const part = parts[index] ?? "";
      const isFile = index === parts.length - 1;
      current.children ??= [];
      let child = current.children.find((item) => item.name === part);
      if (!child) {
        child = { name: part, children: isFile ? undefined : [] };
        current.children.push(child);
      }
      current = child;
    }
  }

  sortTree(root);
  return root;
}

function convertValue(value: unknown, key: string): TreeNode {
  if (value === null || value === undefined) return { name: key, info: "null" };
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return { name: key, info: String(value) };
  }
  if (typeof value === "symbol") return { name: key, info: value.toString() };
  if (typeof value === "function") return { name: key, info: value.name || "function" };
  if (Array.isArray(value)) {
    return {
      name: key,
      info: `[${value.length}]`,
      children: value.map((item, index) => convertValue(item, String(index))),
    };
  }
  return {
    name: key,
    children: Object.entries(value).map(([childKey, childValue]) => convertValue(childValue, childKey)),
  };
}

/**
 * Build a tree from a plain object.
 *
 * @param obj - Nested object or array
 * @param name - Root label (default `"root"`)
 * @returns A tree whose leaves carry primitive values in `info`
 *
 * @example
 * ```ts
 * showTree(treeFromObject({ name: "scriptdx" }, "package.json"));
 * ```
 */
export function treeFromObject(obj: object, name = "root"): TreeNode {
  return convertValue(obj, name);
}

/**
 * Print {@link showTree} to stdout.
 *
 * @param node - Root node
 * @param options - Display options
 */
export function printTree(node: TreeNode, options: TreeOptions = {}): void {
  console.log(showTree(node, options));
}
