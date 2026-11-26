/**
 * @category FORMAT
 * @description Human-readable numbers, bytes, durations, and relative time.
 */

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB", "PB", "EB"] as const;
const BYTE_UNITS_BINARY = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"] as const;
const NUMBER_UNITS = ["", "K", "M", "B", "T", "Q"] as const;

/** Options for {@link formatBytes}. */
export type ByteFormatOptions = {
  /** Use binary units (1024) instead of decimal (1000). */
  binary?: boolean;
  /** Decimal places (default `2`). */
  decimals?: number;
  /** Space between number and unit (default `true`). */
  space?: boolean;
  /** Locale passed to `toLocaleString`. */
  locale?: string;
};

/** Options for {@link formatNumber}. */
export type NumberFormatOptions = {
  /** Decimal places (default `1`). */
  decimals?: number;
  /** Space between number and unit (default `false`). */
  space?: boolean;
  /** Locale passed to `toLocaleString`. */
  locale?: string;
  /** Absolute value where abbreviation starts (default `1000`). */
  threshold?: number;
};

/** Options for {@link formatDuration}. */
export type DurationFormatOptions = {
  /** Use `1h 2m` instead of `1 hour, 2 minutes`. */
  compact?: boolean;
  /** Maximum unit parts to include (default `3`). */
  maxUnits?: number;
};

/** Options for {@link formatPercent}. */
export type PercentFormatOptions = {
  /** Decimal places (default `1`). */
  decimals?: number;
  /** When `true` (default), `value` is a ratio from 0 to 1. */
  isRatio?: boolean;
};

/** Options for {@link formatRelativeTime}. */
export type RelativeTimeOptions = {
  /** Reference instant. Default `Date.now()`. */
  now?: Date | number;
};

function trimFraction(formatted: string): string {
  if (!formatted.includes(".")) return formatted;
  return formatted.replace(/0+$/, "").replace(/\.$/, "");
}

function formatScaled(value: number, decimals: number, locale?: string): string {
  const formatted = locale
    ? value.toLocaleString(locale, { maximumFractionDigits: decimals })
    : value.toFixed(decimals);
  return trimFraction(formatted);
}

/**
 * Format a byte count as a human-readable size.
 *
 * @param bytes - Number of bytes
 * @param options - Unit base, decimals, spacing, and locale
 * @returns A string such as `"1.54 MB"`
 *
 * @example
 * ```ts
 * formatBytes(1536); // "1.54 KB"
 * formatBytes(1536, { binary: true }); // "1.5 KiB"
 * ```
 */
export function formatBytes(bytes: number, options: ByteFormatOptions = {}): string {
  const { binary = false, decimals = 2, space = true, locale } = options;
  const gap = space ? " " : "";
  if (bytes === 0) return `0${gap}B`;
  if (!Number.isFinite(bytes)) return "Invalid";

  const base = binary ? 1024 : 1000;
  const units = binary ? BYTE_UNITS_BINARY : BYTE_UNITS;
  const exponent = Math.min(
    Math.floor(Math.log(Math.abs(bytes)) / Math.log(base)),
    units.length - 1,
  );
  const value = bytes / base ** exponent;
  return `${formatScaled(value, decimals, locale)}${gap}${units[exponent] ?? "B"}`;
}

/**
 * Abbreviate a large number with K/M/B suffixes.
 *
 * @param num - Number to format
 * @param options - Decimals, threshold, spacing, and locale
 * @returns A string such as `"1.2M"`
 *
 * @example
 * ```ts
 * formatNumber(1234); // "1.2K"
 * formatNumber(1234567); // "1.2M"
 * ```
 */
export function formatNumber(num: number, options: NumberFormatOptions = {}): string {
  const { decimals = 1, space = false, locale, threshold = 1000 } = options;
  if (!Number.isFinite(num)) return "Invalid";
  if (Math.abs(num) < threshold) return locale ? num.toLocaleString(locale) : String(num);

  const sign = num < 0 ? "-" : "";
  const absNum = Math.abs(num);
  const exponent = Math.min(Math.floor(Math.log10(absNum) / 3), NUMBER_UNITS.length - 1);
  const value = absNum / 1000 ** exponent;
  const gap = space ? " " : "";
  return `${sign}${formatScaled(value, decimals, locale)}${gap}${NUMBER_UNITS[exponent] ?? ""}`;
}

const DURATION_UNITS = [
  { name: "d", full: "day", ms: 86_400_000 },
  { name: "h", full: "hour", ms: 3_600_000 },
  { name: "m", full: "minute", ms: 60_000 },
  { name: "s", full: "second", ms: 1000 },
] as const;

/**
 * Format a millisecond duration.
 *
 * @param ms - Duration in milliseconds
 * @param options - Compact labels and how many units to keep
 * @returns A string such as `"1 minute, 30 seconds"` or `"1m 30s"`
 *
 * @example
 * ```ts
 * formatDuration(90_000, { compact: true }); // "1m 30s"
 * ```
 */
export function formatDuration(ms: number, options: DurationFormatOptions = {}): string {
  const { compact = false, maxUnits = 3 } = options;
  if (ms < 0 || !Number.isFinite(ms)) return "Invalid";
  if (ms === 0) return compact ? "0ms" : "0 milliseconds";
  if (ms < 1000) return `${ms}ms`;

  const parts: string[] = [];
  let remaining = ms;
  for (const unit of DURATION_UNITS) {
    if (remaining >= unit.ms && parts.length < maxUnits) {
      const value = Math.floor(remaining / unit.ms);
      remaining %= unit.ms;
      parts.push(compact ? `${value}${unit.name}` : `${value} ${value === 1 ? unit.full : `${unit.full}s`}`);
    }
  }
  return compact ? parts.join(" ") : parts.join(", ");
}

/**
 * Format a percentage.
 *
 * @param value - Ratio (`0.755`) or already-scaled percent when `isRatio` is false
 * @param options - Decimals and ratio mode
 * @returns A string such as `"75.5%"`
 *
 * @example
 * ```ts
 * formatPercent(0.755); // "75.5%"
 * formatPercent(75.5, { isRatio: false }); // "75.5%"
 * ```
 */
export function formatPercent(value: number, options: PercentFormatOptions = {}): string {
  const { decimals = 1, isRatio = true } = options;
  if (!Number.isFinite(value)) return "Invalid";
  const percent = isRatio ? value * 100 : value;
  return `${trimFraction(percent.toFixed(decimals))}%`;
}

const RELATIVE_UNITS = [
  { name: "year", ms: 31_536_000_000 },
  { name: "month", ms: 2_592_000_000 },
  { name: "week", ms: 604_800_000 },
  { name: "day", ms: 86_400_000 },
  { name: "hour", ms: 3_600_000 },
  { name: "minute", ms: 60_000 },
  { name: "second", ms: 1000 },
] as const;

/**
 * Format an instant relative to now.
 *
 * @param date - Target date or timestamp
 * @param options - Optional reference clock
 * @returns A string such as `"1 minute ago"` or `"in 1 hour"`
 *
 * @example
 * ```ts
 * formatRelativeTime(Date.now() - 60_000); // "1 minute ago"
 * ```
 */
export function formatRelativeTime(date: Date | number, options: RelativeTimeOptions = {}): string {
  const now = options.now ?? Date.now();
  const target = date instanceof Date ? date.getTime() : date;
  const nowMs = now instanceof Date ? now.getTime() : now;
  const diff = target - nowMs;
  const absDiff = Math.abs(diff);
  const isFuture = diff > 0;

  for (const unit of RELATIVE_UNITS) {
    if (absDiff >= unit.ms) {
      const value = Math.floor(absDiff / unit.ms);
      const label = value === 1 ? unit.name : `${unit.name}s`;
      return isFuture ? `in ${value} ${label}` : `${value} ${label} ago`;
    }
  }
  return "just now";
}
