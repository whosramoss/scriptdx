// -------------------------------------------------------
// Category    :: FONT
// Description :: Show script title.
// -------------------------------------------------------
import { FONT_HEIGHT, FONT_MAP } from "./glyphs.js";

function getGlyph(char: string): string[] {
  return FONT_MAP[char] ?? [char];
}

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
