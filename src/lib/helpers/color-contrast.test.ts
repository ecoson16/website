import { expect, test } from "vitest";
import { getContrastRatio } from "./color-contrast.ts";

test("returns 21:1 for black and white", () => {
  expect(getContrastRatio("#000000", "#ffffff")).toBe(21);
  expect(getContrastRatio("#ffffff", "#000000")).toBe(21);
});

test("distinguishes pass and fail around the WCAG AA normal-text threshold", () => {
  expect(getContrastRatio("#767676", "#ffffff")).toBeGreaterThanOrEqual(4.5);
  expect(getContrastRatio("#777777", "#ffffff")).toBeLessThan(4.5);
});

test("returns null for invalid or alpha-bearing colors", () => {
  expect(getContrastRatio("not-a-color", "#ffffff")).toBeNull();
  expect(getContrastRatio("#ffffff80", "#000000")).toBeNull();
});
