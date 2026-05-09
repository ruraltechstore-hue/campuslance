import { describe, it, expect } from "vitest";
import { pickPrimaryRole } from "@/lib/appRole";

describe("pickPrimaryRole", () => {
  it("prefers admin over business and student", () => {
    expect(pickPrimaryRole([{ role: "business" }, { role: "admin" }])).toBe("admin");
  });

  it("prefers business over student", () => {
    expect(pickPrimaryRole([{ role: "student" }, { role: "business" }])).toBe("business");
  });

  it("returns student when only student", () => {
    expect(pickPrimaryRole([{ role: "student" }])).toBe("student");
  });

  it("returns null when empty", () => {
    expect(pickPrimaryRole([])).toBeNull();
  });
});
