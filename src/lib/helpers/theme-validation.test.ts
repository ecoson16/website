import { expect, test } from "vitest";
import { DefaultColors, DefaultCSS } from "@/constants/customization.ts";
import {
  mergeThemeColors,
  sanitizeColorOverrides,
  sanitizeThemeStyles,
} from "./theme-validation.ts";

test("only accepts supported six-digit color fields", () => {
  expect(sanitizeColorOverrides({
    Base: "#102030",
    Window: "#AABBCC",
    Unknown: "#123456",
    Text: "red",
    Highlight: 42,
  })).toEqual({
    Base: "#102030",
    Window: "#AABBCC",
  });
});

test("merges valid stored colors with defaults", () => {
  expect(mergeThemeColors({
    Base: "#010203",
    Text: "broken",
  })).toEqual({
    ...DefaultColors,
    Base: "#010203",
  });
});

test("resets malformed stylesheet fields instead of trusting stored JSON", () => {
  const result = sanitizeThemeStyles({
    LayoutBorder: true,
    QToolButton: {
      border: true,
      padding: 1000,
      "background-color": "url(javascript:alert(1))",
      unexpected: "value",
    },
    "QTabBar::tab": {
      padding: 8,
      "margin-right": -1,
      border: "yes",
    },
  });

  expect(result.LayoutBorder).toBe(true);
  expect(result["QToolButton"].border).toBe(true);
  expect(result["QToolButton"].padding).toBe(false);
  expect(result["QToolButton"]["background-color"]).toBe(false);
  expect(result["QTabBar::tab"].padding).toBe(8);
  expect(result["QTabBar::tab"]["margin-right"]).toBe(false);
  expect(result["QTabBar::tab"].border).toBe(false);
  expect(Object.keys(result)).toEqual(Object.keys(DefaultCSS));
});
