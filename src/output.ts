/** Optional destination for CLI writers. */
export type OutputOptions = {
  /** Writable stream (default `process.stdout`, unless noted by the caller). */
  stream?: NodeJS.WritableStream;
};

/**
 * Resolve the stream to write to.
 *
 * @param options - Optional stream override
 * @param fallback - Used when `options.stream` is omitted (default `process.stdout`)
 */
export function getOutputStream(
  options?: OutputOptions,
  fallback: NodeJS.WritableStream = process.stdout,
): NodeJS.WritableStream {
  return options?.stream ?? fallback;
}
