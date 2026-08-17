import { describe, expect, it } from "vitest";
import {
  getSearchDestination,
  getUserNavigationSection,
  isSupportedUserIdentifier,
} from "../navigation";

describe("context-aware user search", () => {
  it("keeps map searches on the map", () => {
    expect(getSearchDestination("/users/USR001/map", " usr025 ")).toBe(
      "/users/USR025/map",
    );
  });

  it("keeps profile and analytics context", () => {
    expect(getSearchDestination("/users/USR001/profile", "01000000025")).toBe(
      "/users/01000000025/profile",
    );
    expect(getSearchDestination("/users/USR001/analytics", "USR050")).toBe(
      "/users/USR050/analytics",
    );
  });

  it("uses the profile route from global pages", () => {
    expect(getSearchDestination("/dashboard", "01000000025")).toBe(
      "/users/01000000025/profile",
    );
  });

  it("recognizes international phone identifiers and their active section", () => {
    expect(isSupportedUserIdentifier("+8801728917865")).toBe(true);
    expect(getUserNavigationSection("/users/+8801728917865/profile")).toBe(
      "profile",
    );
    expect(getUserNavigationSection("/users/+8801728917865/map")).toBe("map");
  });
});
