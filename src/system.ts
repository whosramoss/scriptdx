/**
 * Whether the current process is running on Linux.
 *
 * @returns `true` when `process.platform === "linux"`
 *
 * @example
 * ```ts
 * if (isLinux()) {
 *   // Linux-specific path
 * }
 * ```
 */
export function isLinux(): boolean {
  return process.platform === "linux";
}

/**
 * Whether the current process is running on Windows.
 *
 * @returns `true` when `process.platform === "win32"`
 *
 * @example
 * ```ts
 * if (isWindows()) {
 *   // Windows-specific path
 * }
 * ```
 */
export function isWindows(): boolean {
  return process.platform === "win32";
}
