/**
 * @category LINK
 * @description OSC 8 terminal hyperlinks with plain-text fallbacks.
 */

import { ansi, styles, type LoggerColor } from "./colors.js";

/** Options for {@link link}. */
export type LinkOptions = {
  /** Text color (default `lightBlue`). */
  color?: LoggerColor;
  /** Underline the label (default `true`). */
  underline?: boolean;
  /** What to print when OSC 8 is unavailable. */
  fallback?: "url" | "both" | "text";
  /** Optional id parameter for terminals that support it. */
  id?: string;
};

const ESC = String.fromCharCode(0x1b);
const URL_PATTERN = /https?:\/\/[^\s]+/g;

/**
 * Guess whether the current terminal accepts OSC 8 hyperlinks.
 *
 * @returns `true` for known terminals and `COLORTERM=truecolor`
 */
export function supportsHyperlinks(): boolean {
  if (process.env.TERM_PROGRAM === "iTerm.app") return true;
  if (process.env.WT_SESSION) return true;
  if (process.env.TERM_PROGRAM === "vscode") return true;
  if (process.env.KONSOLE_VERSION) return true;
  if (process.env.TERM_PROGRAM === "Hyper") return true;
  if (process.env.COLORTERM === "truecolor") return true;
  return false;
}

function styleLabel(text: string, options: LinkOptions): string {
  const color = options.color ?? "lightBlue";
  const colored = ansi(styles[color], text);
  if (options.underline === false) return colored;
  return `${ESC}[4m${colored}${ESC}[24m`;
}

/**
 * Build a clickable terminal link.
 * Unsupported terminals use `fallback` (`"both"` by default).
 *
 * @param text - Visible label
 * @param url - Target URL
 * @param options - Color, underline, fallback, and id
 * @returns An OSC 8 sequence or a plain fallback
 *
 * @example
 * ```ts
 * console.log(link("Docs", "https://example.com"));
 * ```
 */
export function link(text: string, url: string, options: LinkOptions = {}): string {
  const styled = styleLabel(text, options);
  if (supportsHyperlinks()) {
    const params = options.id ? `id=${options.id}` : "";
    return `${ESC}]8;${params};${url}${ESC}\\${styled}${ESC}]8;;${ESC}\\`;
  }

  switch (options.fallback ?? "both") {
    case "url":
      return url;
    case "text":
      return styled;
    default:
      return `${styled} (${ansi(styles.darkGray, url)})`;
  }
}

/**
 * Build a `mailto:` link.
 *
 * @param text - Visible label
 * @param email - Email address
 * @param options - Link options
 */
export function mailto(text: string, email: string, options: LinkOptions = {}): string {
  return link(text, `mailto:${email}`, options);
}

/**
 * Build a `file://` link.
 *
 * @param text - Visible label
 * @param path - File path or `file://` URL
 * @param options - Link options
 */
export function fileLink(text: string, path: string, options: LinkOptions = {}): string {
  const fileUrl = path.startsWith("file://") ? path : `file://${path}`;
  return link(text, fileUrl, options);
}

/**
 * Turn bare URLs in `text` into links. Trailing punctuation stays outside the URL.
 *
 * @param text - Source text
 * @param options - Link options applied to each URL
 * @returns Text with each URL replaced
 *
 * @example
 * ```ts
 * linkify("See https://example.com.");
 * ```
 */
export function linkify(text: string, options: LinkOptions = {}): string {
  return text.replace(URL_PATTERN, (url) => {
    const match = /[.,;:!?)]+$/.exec(url);
    const suffix = match?.[0] ?? "";
    const cleanUrl = suffix ? url.slice(0, -suffix.length) : url;
    return link(cleanUrl, cleanUrl, options) + suffix;
  });
}

/**
 * Print {@link link} to stdout.
 *
 * @param text - Visible label
 * @param url - Target URL
 * @param options - Link options
 */
export function printLink(text: string, url: string, options: LinkOptions = {}): void {
  console.log(link(text, url, options));
}

/**
 * Render a bulleted list of links.
 *
 * @param links - Pairs of label and URL
 * @param options - Link options plus an optional bullet
 * @returns A multi-line list
 */
export function linkList(
  links: Array<[string, string]>,
  options: LinkOptions & { bullet?: string } = {},
): string {
  const { bullet = "•", ...linkOptions } = options;
  return links.map(([text, url]) => `  ${bullet} ${link(text, url, linkOptions)}`).join("\n");
}

/**
 * Join linked crumbs with a separator.
 *
 * @param items - Pairs of label and URL
 * @param separator - Text between crumbs (default `" > "`)
 * @param options - Link options
 * @returns A single line
 */
export function breadcrumb(
  items: Array<[string, string]>,
  separator = " > ",
  options: LinkOptions = {},
): string {
  return items.map(([text, url]) => link(text, url, options)).join(ansi(styles.darkGray, separator));
}
