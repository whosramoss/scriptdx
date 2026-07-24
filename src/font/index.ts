import { FONT_HEIGHT, FONT_MAP } from "./glyphs.js";

function getGlyph(char: string): string[] {
  return FONT_MAP[char] ?? [char];
}

/**
 * Render a word as large block-letter ASCII art.
 * Only A–Z and a–z are mapped; other characters appear as-is.
 *
 * @param word - Text to render (alphabetic characters only for full effect)
 * @returns Multi-line string (10 lines tall)
 *
 * @example
 * ```ts
 * console.log(showScriptTitle("Hello"));
 * ```
 */
export function showScriptTitle(word: string): string {
  const lines: string[] = Array.from({ length: FONT_HEIGHT }, () => "");

  for (let i = 0; i < FONT_HEIGHT; i += 1) {
    let line = "";
    for (const letter of word) {
      const glyph = getGlyph(letter);
      line += `${glyph[i] ?? " "} `;
    }
    lines[i] = line.trimEnd();
  }

  return lines.join("\n");
}
