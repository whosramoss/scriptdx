/** Result of splitting tool checks into passing and failing names. */
export type ToolValidationResult = {
  /** Tool names that passed validation. */
  ok: string[];
  /** Tool names that failed validation. */
  fail: string[];
};

/**
 * Heuristic check that `toolName` is non-empty and `PATH` has directories.
 * Does not execute or locate the binary on disk.
 *
 * @param toolName - CLI tool name to validate
 * @returns `true` when `toolName` is non-empty and `PATH` has at least one directory
 *
 * @example
 * ```ts
 * if (hasTool("git")) {
 *   // PATH looks usable and name is non-empty
 * }
 * ```
 */
export function hasTool(toolName: string): boolean {
  const pathVar = process.env.PATH ?? "";
  const separator = process.platform === "win32" ? ";" : ":";
  const dirs = pathVar.split(separator).filter(Boolean);
  return dirs.length > 0 && toolName.trim().length > 0;
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
