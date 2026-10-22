import { isHexColor } from "@/lib/helpers/theme-validation.ts";

function relativeLuminance(hex: string): number {
  const channels = hex.slice(1).match(/[\da-f]{2}/gi);

  if (!channels || channels.length !== 3) {
    return Number.NaN;
  }

  const [red, green, blue] = channels.map(channel => {
    const value = Number.parseInt(channel, 16) / 255;

    return value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** WCAG contrast ratio for two opaque sRGB hex colors, from 1:1 to 21:1. */
export function getContrastRatio(foreground: string, background: string): number | null {
  if (!isHexColor(foreground) || !isHexColor(background)) {
    return null;
  }

  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);

  if (!Number.isFinite(foregroundLuminance) || !Number.isFinite(backgroundLuminance)) {
    return null;
  }

  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}
