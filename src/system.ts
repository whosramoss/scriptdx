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

/**
 * Whether the current process is running on macOS.
 *
 * @returns `true` when `process.platform === "darwin"`
 *
 * @example
 * ```ts
 * if (isMac()) {
 *   // macOS-specific path
 * }
 * ```
 */
export function isMac(): boolean {
  return process.platform === "darwin";
}

/**
 * Alias for {@link isMac}.
 * Uses the underlying platform identifier name.
 *
 * @returns `true` when `process.platform === "darwin"`
 */
export function isDarwin(): boolean {
  return isMac();
}

/** Normalized name for the current operating system. */
export type Platform = "windows" | "linux" | "mac" | "unknown";

/**
 * Get the current platform as a normalized string.
 *
 * @returns `"windows"`, `"linux"`, `"mac"`, or `"unknown"`
 *
 * @example
 * ```ts
 * const platform = getPlatform();
 * switch (platform) {
 *   case "windows":
 *   case "linux":
 *   case "mac":
 *     break;
 * }
 * ```
 */
export function getPlatform(): Platform {
  if (isWindows()) return "windows";
  if (isLinux()) return "linux";
  if (isMac()) return "mac";
  return "unknown";
}
