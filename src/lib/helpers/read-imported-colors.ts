import { DefaultColors } from "@/constants/customization.ts";
import { isRecord, sanitizeColorOverrides } from "@/lib/helpers/theme-validation.ts";

export function parseImportedColors(content: string): Partial<typeof DefaultColors> | 0 {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    return 0;
  }

  if (!isRecord(parsed) || !isRecord(parsed.colors)) {
    return 0;
  }

  return sanitizeColorOverrides(parsed.colors) ?? 0;
}

export async function readImportedColors({
  event,
}: {
  "event": Event;
}): Promise<Partial<typeof DefaultColors> | 0> {
  const target = event.target as HTMLInputElement | null;
  const file = target?.files?.[0];

  if (!file) {
    return 0;
  }

  try {
    const content = await file.text();
    const imported = parseImportedColors(content);

    if (imported === 0) {
      console.error("Imported theme did not contain any valid supported color values");
    }

    return imported;
  } catch (error: unknown) {
    console.error("Couldn't read the imported color scheme:", error);

    return 0;
  }
}
