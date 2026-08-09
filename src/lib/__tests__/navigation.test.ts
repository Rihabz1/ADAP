import { describe, expect, it } from "vitest";
import { getSearchDestination } from "../navigation";

describe("context-aware user search", () => {
  it("keeps map searches on the map", () => {
    expect(getSearchDestination("/users/USR001/map", " usr025 ")).toBe(
      "/users/USR025/map",
    );
  });

  it("keeps timeline and analytics context", () => {
    expect(getSearchDestination("/users/USR001/timeline", "01000000025")).toBe(
      "/users/01000000025/timeline",
    );
    expect(getSearchDestination("/users/USR001/analytics", "USR050")).toBe(
      "/users/USR050/analytics",
    );
  });

  it("uses the profile route from global pages", () => {
    expect(getSearchDestination("/dashboard", "USR100")).toBe("/users/USR100");
  });
});
