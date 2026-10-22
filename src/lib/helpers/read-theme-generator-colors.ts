import { DefaultColors } from "@/constants/customization.ts";
import { ThemeGeneratorKeys } from "@/constants/application.ts";
import { mergeThemeColors } from "@/lib/helpers/theme-validation.ts";

export function readThemeGeneratorColors(): typeof DefaultColors {
  try {
    const stored = localStorage.getItem(ThemeGeneratorKeys.Colors);

    if (!stored) {
      return { ...DefaultColors };
    }

    return mergeThemeColors(JSON.parse(stored) as unknown);
  } catch {
    // Invalid JSON or unavailable browser storage should never stop the editor.
    return { ...DefaultColors };
  }
}
