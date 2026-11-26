/**
 * @category STEP
 * @description Named spinner frame sets.
 */

/** Predefined spinner frame sets. */
export const spinnerPresets = {
  dots: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  line: ["|", "/", "-", "\\"],
  growDots: ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"],
  arrow: ["←", "↖", "↑", "↗", "→", "↘", "↓", "↙"],
  circle: ["◐", "◓", "◑", "◒"],
  square: ["◰", "◳", "◲", "◱"],
  bounce: ["⠁", "⠂", "⠄", "⠂"],
  clock: ["🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "🕛"],
  moon: ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"],
  ascii: ["[    ]", "[=   ]", "[==  ]", "[=== ]", "[====]", "[ ===]", "[  ==]", "[   =]"],
  pulse: ["⣀", "⣤", "⣶", "⣿", "⣶", "⣤"],
  hamburger: ["☱", "☲", "☴"],
} as const;

/** Name of a {@link spinnerPresets} entry. */
export type SpinnerPreset = keyof typeof spinnerPresets;

/**
 * Return the frames for a preset.
 *
 * @param preset - Preset name
 * @returns Read-only frame list
 *
 * @example
 * ```ts
 * getSpinnerFrames("arrow");
 * ```
 */
export function getSpinnerFrames(preset: SpinnerPreset): readonly string[] {
  return spinnerPresets[preset];
}
