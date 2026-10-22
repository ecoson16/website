import { DefaultCSS } from "@/constants/customization.ts";
import { ThemeGeneratorKeys } from "@/constants/application.ts";
import { sanitizeThemeStyles } from "@/lib/helpers/theme-validation.ts";

export function readThemeGeneratorStyles(): typeof DefaultCSS {
  try {
    const stored = localStorage.getItem(ThemeGeneratorKeys.Styles);

    if (!stored) {
      return sanitizeThemeStyles(DefaultCSS);
    }

    return sanitizeThemeStyles(JSON.parse(stored) as unknown);
  } catch {
    // Invalid JSON or unavailable browser storage should never stop the editor.
    return sanitizeThemeStyles(DefaultCSS);
  }
}
