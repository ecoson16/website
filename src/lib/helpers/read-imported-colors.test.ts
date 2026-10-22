import { expect, test } from "vitest";
import { parseImportedColors } from "./read-imported-colors.ts";

test("imports supported colors and ignores unknown or invalid fields", () => {
  expect(parseImportedColors(JSON.stringify({
    colors: {
      Base: "#102030",
      Highlight: "#ABCDEF",
      UnknownKey: "#123456",
      Text: "hotpink",
      fadeAmount: 0.5,
    },
  }))).toEqual({
    Base: "#102030",
    Highlight: "#ABCDEF",
  });
});

test("rejects malformed JSON and invalid colors containers", () => {
  expect(parseImportedColors("{oops")).toBe(0);
  expect(parseImportedColors(JSON.stringify(null))).toBe(0);
  expect(parseImportedColors(JSON.stringify({ colors: "nope" }))).toBe(0);
  expect(parseImportedColors(JSON.stringify({ colors: { Base: 123 } }))).toBe(0);
  expect(parseImportedColors(JSON.stringify({ colors: {} }))).toBe(0);
});

test("supports partial theme imports", () => {
  expect(parseImportedColors(JSON.stringify({
    colors: { Window: "#abcdef" },
  }))).toEqual({ Window: "#abcdef" });
});
