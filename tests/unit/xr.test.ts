import { it, expect } from "vitest";
import { glassContact } from "../../src/xr";
it("projects 3D index contact onto the mirror and uses depth hysteresis", () => {
  expect(glassContact({ x: 0, y: -0.05, z: -0.55 }, 0.9, 0.6)).toEqual({
    x: 0.5,
    y: 0.5,
    down: true,
  });
  expect(glassContact({ x: 0, y: -0.05, z: -0.515 }, 0.9, 0.6).down).toBe(
    false,
  );
  expect(glassContact({ x: 0, y: -0.05, z: -0.515 }, 0.9, 0.6, true).down).toBe(
    true,
  );
  expect(glassContact({ x: 1, y: 0, z: -0.55 }, 0.9, 0.6, true).down).toBe(
    false,
  );
  expect(glassContact({ x: 0, y: 0, z: -0.1 }, 0.9, 0.6, true).down).toBe(
    false,
  );
});
