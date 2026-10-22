import { expect, test } from "vitest";
import { sanitizeExportName } from "./sanitize-export-name.ts";

test("replaces invalid path characters and condenses whitespace", () => {
  expect(sanitizeExportName("  My:  Theme/Blue  ")).toBe("My- Theme-Blue");
  expect(sanitizeExportName("a\\b|c")).toBe("a-b-c");
});

test("provides a safe fallback for empty and path-only names", () => {
  expect(sanitizeExportName("")).toBe("My Custom Theme");
  expect(sanitizeExportName("   ")).toBe("My Custom Theme");
  expect(sanitizeExportName(".")).toBe("My Custom Theme");
  expect(sanitizeExportName("..")).toBe("My Custom Theme");
});

test("limits the folder name length", () => {
  expect(sanitizeExportName("a".repeat(100))).toHaveLength(64);
});

test("replaces control characters", () => {
  expect(sanitizeExportName("theme\u0000name")).toBe("theme-name");
});
