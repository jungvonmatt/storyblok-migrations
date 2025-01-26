import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  configureStoryblok,
  verifyExistingConfig,
  promptForConfig,
} from "../../commands/config";
import { loadConfig, loadEnvConfig, saveConfig } from "../../utils/config";
import { confirm, input } from "@inquirer/prompts";

vi.mock("../../utils/config");
vi.mock("@inquirer/prompts");
vi.mock("picocolors", () => ({
  default: {
    green: vi.fn((str) => str),
    red: vi.fn((str) => str),
    blue: vi.fn((str) => str),
    yellow: vi.fn((str) => str),
  },
}));

describe("config commands", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.resetAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("verifyExistingConfig", () => {
    it("should return null if user doesn't confirm", async () => {
      const mockConfirm = Promise.resolve(false) as Promise<boolean> & {
        cancel: () => void;
      };
      mockConfirm.cancel = () => {};
      vi.mocked(confirm).mockImplementation(() => mockConfirm);

      const result = await verifyExistingConfig({ spaceId: "test" });
      expect(result).toBeNull();
    });

    it("should prompt for missing values if user confirms", async () => {
      const mockConfirm = Promise.resolve(true) as Promise<boolean> & {
        cancel: () => void;
      };
      mockConfirm.cancel = () => {};
      vi.mocked(confirm).mockImplementation(() => mockConfirm);

      const mockInput = Promise.resolve("test-value") as Promise<string> & {
        cancel: () => void;
      };
      mockInput.cancel = () => {};
      vi.mocked(input).mockImplementation(() => mockInput);

      const result = await verifyExistingConfig({ spaceId: "existing-space" });

      expect(result).toEqual({
        spaceId: "existing-space",
        oauthToken: "test-value",
      });
    });
  });

  describe("promptForConfig", () => {
    it("should prompt for all values with defaults", async () => {
      vi.mocked(input).mockImplementation(({ message }) => {
        const mockInput = Promise.resolve(
          message.includes("Space ID") ? "new-space" : "new-token"
        ) as Promise<string> & { cancel: () => void };
        mockInput.cancel = () => {};
        return mockInput;
      });

      const result = await promptForConfig({ spaceId: "old-space" });

      expect(result).toEqual({
        spaceId: "new-space",
        oauthToken: "new-token",
      });
    });
  });

  describe("configureStoryblok", () => {
    it("should use existing config when available and verified", async () => {
      const existingConfig = {
        spaceId: "test-space",
        oauthToken: "test-token",
      };
      vi.mocked(loadConfig).mockResolvedValue(existingConfig);
      vi.mocked(loadEnvConfig).mockResolvedValue({});

      const mockConfirm = Promise.resolve(true) as Promise<boolean> & {
        cancel: () => void;
      };
      mockConfirm.cancel = () => {};
      vi.mocked(confirm).mockImplementation(() => mockConfirm);

      await configureStoryblok();

      expect(saveConfig).toHaveBeenCalledWith(existingConfig);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Configuration saved successfully")
      );
    });

    it("should handle errors gracefully", async () => {
      vi.mocked(loadConfig).mockRejectedValue(new Error("Test error"));

      await configureStoryblok();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to configure Storyblok")
      );
    });
  });
});
