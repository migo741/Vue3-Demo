import { getCurrentIndex } from "@/hooks/getCurrentIndex.js";
import { test, expect } from "vitest";

test("getCurrentIndex", () => {
  expect(getCurrentIndex(40, [10, 20, 30, 40])).toBe(3);
});
