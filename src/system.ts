// -------------------------------------------------------
// Category    :: SYSTEM
// Description :: Host system helpers.
// -------------------------------------------------------
export function isLinux(): boolean {
  return process.platform === "linux";
}

export function isWindows(): boolean {
  return process.platform === "win32";
}
