import { FONT_HEIGHT, getFontMap } from "./glyphs.js";

/**
 * Render a word as large block-letter ASCII art.
 * Only A–Z and a–z are mapped; other characters appear as-is.
 *
 * The glyph map is allocated on the first call.
 *
 * @param word - Text to render (alphabetic characters only for full effect)
 * @returns Multi-line string (10 lines tall)
 *
 * @example
 * ```ts
 * import { showScriptTitle } from "scriptdx/font";
 * console.log(showScriptTitle("Hello"));
 * ```
 */
export function showScriptTitle(word: string): string {
  const fontMap = getFontMap();
  const lines: string[] = Array.from({ length: FONT_HEIGHT }, () => "");

  for (let i = 0; i < FONT_HEIGHT; i += 1) {
    let line = "";
    for (const letter of word) {
      const glyph = fontMap[letter] ?? [letter];
      line += `${glyph[i] ?? " "} `;
    }
    lines[i] = line.trimEnd();
  }

  return lines.join("\n");
}
