import { expect, test } from "vitest";
import { HEXToRGBA } from "./hex-to-rgba.ts";

const testData: Array<[{ "hex": string; "alpha"?: number }, string]> = [
  [{ "hex": "#7f11e0", "alpha": 255 }, "rgba(127, 17, 224, 1)"],
  [{ "hex": "#00d1b2", "alpha": 255 }, "rgba(0, 209, 178, 1)"],
  [{ "hex": "#00d1b2" }, "rgba(0, 209, 178, 1)"],
  [{ "hex": "#000000" }, "rgba(0, 0, 0, 1)"],
  [{ "hex": "#ffffff" }, "rgba(255, 255, 255, 1)"],
  [{ "hex": "#ff00ff" }, "rgba(255, 0, 255, 1)"],
  [{ "hex": "#0000ff", "alpha": 0 }, "rgba(0, 0, 255, 0)"],
  [{ "hex": "#00ffff", "alpha": 123 }, "rgba(0, 255, 255, 0.482)"],
  [{ "hex": "#00ffff4B" }, "rgba(0, 255, 255, 0.294)"],
  [{ "hex": "#00ffff32" }, "rgba(0, 255, 255, 0.196)"],
  [{ "hex": "#00ffff19" }, "rgba(0, 255, 255, 0.098)"],
  [{ "hex": "#00ffffFF", "alpha": 0 }, "rgba(0, 255, 255, 1)"],
  [{ "hex": "#00ffff", "alpha": 300 }, "rgba(0, 255, 255, 1)"],
];

for (const [input, output] of testData) {
  test(`HEX to RGBA: ${JSON.stringify(input)}`, () => {
    expect(HEXToRGBA(input)).toBe(output);
  });
}

test("rejects malformed hexadecimal colors", () => {
  expect(() => HEXToRGBA({ "hex": "red" })).toThrow(TypeError);
  expect(() => HEXToRGBA({ "hex": "#12345" })).toThrow(TypeError);
});
