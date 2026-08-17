import { describe, expect, it } from "vitest";
import {
  examplePhoneNumbers,
  sanitizePhoneInput,
} from "../search-examples";

describe("phone search examples", () => {
  it("provides the requested international suggestions", () => {
    expect(examplePhoneNumbers).toEqual([
      "+8801852381087",
      "+8801371764059",
      "+8801728917865",
    ]);
  });

  it("preserves a leading plus while sanitizing phone input", () => {
    expect(sanitizePhoneInput("+880 1852-381087")).toBe("+8801852381087");
    expect(sanitizePhoneInput("01809-070598")).toBe("01809070598");
  });
});
