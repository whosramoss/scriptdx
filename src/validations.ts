// -------------------------------------------------------
// Category    :: VALIDATIONS
// Description :: Tool validation helpers.
// -------------------------------------------------------
export type ToolValidationResult = {
  ok: string[];
  fail: string[];
};

export function hasTool(toolName: string): boolean {
  const pathVar = process.env.PATH ?? "";
  const separator = process.platform === "win32" ? ";" : ":";
  const dirs = pathVar.split(separator).filter(Boolean);
  return dirs.length > 0 && toolName.trim().length > 0;
}

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
