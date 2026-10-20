import { it, expect, vi } from "vitest";
import { HandLandmarker } from "@mediapipe/tasks-vision";
import { createHandModel } from "../../src/tracking/model";
vi.mock("@mediapipe/tasks-vision", () => ({
  HandLandmarker: { createFromOptions: vi.fn() },
}));
it("initializes CPU when a worker GPU context cannot be created", async () => {
  const create = vi.mocked(HandLandmarker.createFromOptions);
  create.mockRejectedValueOnce(new Error("GPU context unavailable"));
  create.mockResolvedValueOnce({ close() {} } as HandLandmarker);
  const result = await createHandModel(
    {} as Parameters<typeof HandLandmarker.createFromOptions>[0],
    "/models/hand_landmarker.task",
  );
  expect(result.delegate).toBe("CPU");
  expect(
    create.mock.calls.map((call) => call[1].baseOptions?.delegate),
  ).toEqual(["GPU", "CPU"]);
});
