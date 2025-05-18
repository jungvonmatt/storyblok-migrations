import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPreview, bloksEmpty } from "../../utils/component";
import { truncate } from "lodash";
import type { Mock } from "vitest";

// Mock the @sindresorhus/is module
vi.mock("@sindresorhus/is", () => ({
  isString: vi.fn(),
  isNumber: vi.fn(),
  isObject: vi.fn(),
}));

describe("Component Utilities", () => {
  describe("bloksEmpty", () => {
    it("should return true for empty array", () => {
      expect(bloksEmpty([])).toBe(true);
    });

    it("should return true for non-array input", () => {
      expect(bloksEmpty(null)).toBe(true);
      expect(bloksEmpty(undefined)).toBe(true);
      expect(bloksEmpty("not an array")).toBe(true);
    });

    it("should return false for non-empty array", () => {
      expect(bloksEmpty([1, 2, 3])).toBe(false);
    });
  });

  describe("getPreview", () => {
    let isString: Mock;
    let isNumber: Mock;
    let isObject: Mock;

    beforeEach(async () => {
      vi.clearAllMocks();
      const module = await import("@sindresorhus/is");
      isString = module.isString as unknown as Mock;
      isNumber = module.isNumber as unknown as Mock;
      isObject = module.isObject as unknown as Mock;
    });

    it("should handle string input", async () => {
      // Arrange
      const input = "This is a long string that should be truncated";
      isString.mockReturnValue(true);
      isNumber.mockReturnValue(false);
      isObject.mockReturnValue(false);

      // Act
      const result = await getPreview(input);

      // Assert
      expect(result).toBe(truncate(input));
      expect(isString).toHaveBeenCalledWith(input);
    });

    it("should handle number input", async () => {
      // Arrange
      const input = 42;
      isString.mockReturnValue(false);
      isNumber.mockReturnValue(true);
      isObject.mockReturnValue(false);

      // Act
      const result = await getPreview(input);

      // Assert
      expect(result).toBe(input);
      expect(isNumber).toHaveBeenCalledWith(input);
    });

    it("should handle array input", async () => {
      // Arrange
      const input = ["first", "second", "third"];
      isString.mockReturnValue(false);
      isNumber.mockReturnValue(false);
      isObject.mockReturnValue(false);

      // Mock the recursive call for the first element
      isString.mockReturnValueOnce(true);

      // Act
      const result = await getPreview(input);

      // Assert
      expect(result).toBe(input.join(","));
    });

    it("should handle object input", async () => {
      // Arrange
      const input = { key: "value", nested: { data: 123 } };
      isString.mockReturnValue(false);
      isNumber.mockReturnValue(false);
      isObject.mockReturnValue(true);

      // Act
      const result = await getPreview(input);

      // Assert
      expect(result).toBe(truncate(JSON.stringify(input)));
      expect(isObject).toHaveBeenCalledWith(input);
    });

    it("should handle null input", async () => {
      // Arrange
      const input = null;
      isString.mockReturnValue(false);
      isNumber.mockReturnValue(false);
      isObject.mockReturnValue(false);

      // Act
      const result = await getPreview(input);

      // Assert
      expect(result).toBe(input);
    });

    it("should handle undefined input", async () => {
      // Arrange
      const input = undefined;
      isString.mockReturnValue(false);
      isNumber.mockReturnValue(false);
      isObject.mockReturnValue(false);

      // Act
      const result = await getPreview(input);

      // Assert
      expect(result).toBe(input);
    });

    it("should handle nested array input", async () => {
      // Arrange
      const input: [string[], string] = [["nested", "array"], "second"];
      isString.mockReturnValue(false);
      isNumber.mockReturnValue(false);
      isObject.mockReturnValue(false);

      // Mock the recursive calls
      isString.mockReturnValueOnce(false);
      isString.mockReturnValueOnce(true);

      // Act
      const result = await getPreview(input);

      // Assert
      expect(result).toBe(`[${input[0].join(",")}]`);
    });

    it("should handle complex nested object input", async () => {
      // Arrange
      const input = {
        name: "Test",
        items: [1, 2, 3],
        nested: { key: "value" },
      };
      isString.mockReturnValue(false);
      isNumber.mockReturnValue(false);
      isObject.mockReturnValue(true);

      // Act
      const result = await getPreview(input);

      // Assert
      expect(result).toBe(truncate(JSON.stringify(input)));
    });
  });
});
