import { accessSync, constants, statSync } from "node:fs";
import { basename, join } from "node:path";

/** Result of splitting tool checks into passing and failing names. */
export type ToolValidationResult = {
  /** Tool names that passed validation. */
  ok: string[];
  /** Tool names that failed validation. */
  fail: string[];
};

const WINDOWS_EXECUTABLE_EXTENSIONS = [".exe", ".cmd", ".bat", ".ps1", ""] as const;
const POSIX_EXECUTABLE_EXTENSIONS = [""] as const;

function isBareToolName(toolName: string): boolean {
  return toolName !== "." && toolName !== ".." && basename(toolName) === toolName;
}

function isExecutableFile(candidate: string): boolean {
  try {
    accessSync(candidate, constants.X_OK);
    return statSync(candidate).isFile();
  } catch {
    return false;
  }
}

/**
 * Check whether `toolName` is an executable file on `PATH`.
 * Does not run the binary. Absolute paths, relative paths, `.`, and `..` are rejected.
 * On Windows, `.exe`, `.cmd`, `.bat`, and `.ps1` are searched in that order, then the bare name.
 *
 * @param toolName - Bare CLI tool name to locate
 * @returns `true` when an executable file with that name exists on `PATH`
 *
 * @example
 * ```ts
 * if (hasTool("git")) {
 *   // git is installed and executable
 * }
 * ```
 */
export function hasTool(toolName: string): boolean {
  if (!toolName.trim() || !isBareToolName(toolName)) return false;

  const pathVar = process.env.PATH ?? "";
  const separator = process.platform === "win32" ? ";" : ":";
  const extensions =
    process.platform === "win32" ? WINDOWS_EXECUTABLE_EXTENSIONS : POSIX_EXECUTABLE_EXTENSIONS;
  const dirs = pathVar.split(separator).filter(Boolean);

  for (const dir of dirs) {
    for (const ext of extensions) {
      if (isExecutableFile(join(dir, toolName + ext))) return true;
    }
  }

  return false;
}

/**
 * Split a map of tool name → boolean into `{ ok, fail }` lists.
 *
 * @param results - Record of tool names to pass/fail flags
 * @returns Names grouped by success and failure
 *
 * @example
 * ```ts
 * const summary = summarizeToolValidation({ git: true, docker: false });
 * // { ok: ["git"], fail: ["docker"] }
 * ```
 */
export function summarizeToolValidation(
  results: Record<string, boolean>,
): ToolValidationResult {
  const ok: string[] = [];
  const fail: string[] = [];

  for (const [name, result] of Object.entries(results)) {
    if (result) ok.push(name);
    else fail.push(name);
  }

  return { ok, fail };
}
