import { it, expect } from "vitest";
import { wrapMessage } from "../../src/reveal";
it("wraps local text and caps content without HTML interpretation", () => {
  expect(wrapMessage("Happy birthday\nKrithi")).toEqual([
    "Happy birthday",
    "Krithi",
  ]);
  expect(wrapMessage("a ".repeat(300)).length).toBeLessThanOrEqual(5);
  expect(wrapMessage("<script>alert(1)</script>")[0]).toContain("<script>");
});
