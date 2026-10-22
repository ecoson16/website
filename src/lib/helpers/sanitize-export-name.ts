export function sanitizeExportName(value: string): string {
  const invalidCharacters = String.raw`\\/:*?"<>|`;
  let result = "";
  let previousWasSpace = false;

  for (const character of value.trim()) {
    const code = character.codePointAt(0) ?? 0;

    if (invalidCharacters.includes(character) || code < 32 || code === 127) {
      result += "-";
      previousWasSpace = false;

      continue;
    }

    if (character.trim() === "") {
      if (!previousWasSpace) {
        result += " ";
      }

      previousWasSpace = true;

      continue;
    }

    result += character;
    previousWasSpace = false;
  }

  const safeName = result.slice(0, 64).trim();

  // A ZIP entry under either of these names can become a parent/current path.
  return safeName && safeName !== "." && safeName !== ".."
    ? safeName
    : "My Custom Theme";
}
