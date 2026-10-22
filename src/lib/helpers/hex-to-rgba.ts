export function HEXToRGBA({
  hex,
  alpha = 255,
}: {
  "hex": string;
  /** Alpha channel in byte form (0–255), used when hex has no alpha suffix. */
  "alpha"?: number;
}): string {
  const match = /^#([\da-f]{6})([\da-f]{2})?$/i.exec(hex.trim());

  if (!match) {
    throw new TypeError(`Expected a #RRGGBB or #RRGGBBAA color, received "${hex}"`);
  }

  const channels = match[1].match(/[\da-f]{2}/gi);

  if (!channels || channels.length !== 3) {
    throw new TypeError(`Invalid hexadecimal color: "${hex}"`);
  }

  const [red, green, blue] = channels.map(channel => Number.parseInt(channel, 16));
  const alphaByte = match[2]
    ? Number.parseInt(match[2], 16)
    : Number.isFinite(alpha)
      ? Math.min(255, Math.max(0, alpha))
      : 255;
  const opacity = Number((alphaByte / 255).toFixed(3));

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}
