import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { configureStoryblok } from "../../commands/config";
import {
  loadConfig,
  loadEnvConfig,
  saveConfig,
  verifyExistingConfig,
} from "../../utils/config";
import { StoryblokRegion } from "../../types/config";

vi.mock("../../utils/config");
vi.mock("picocolors", () => ({
  default: {
    green: vi.fn((str) => str),
    red: vi.fn((str) => str),
    blue: vi.fn((str) => str),
    yellow: vi.fn((str) => str),
  },
}));

describe("config command", () => {
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

  describe("configureStoryblok", () => {
    it("should use existing config when available and verified", async () => {
      const existingConfig = {
        spaceId: "test-space",
        oauthToken: "test-token",
        region: "eu" as StoryblokRegion,
      };
      vi.mocked(loadConfig).mockResolvedValue(existingConfig);
      vi.mocked(loadEnvConfig).mockResolvedValue({});
      vi.mocked(verifyExistingConfig).mockResolvedValue(existingConfig);

      await configureStoryblok();

      expect(saveConfig).toHaveBeenCalledWith(existingConfig);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Configuration saved successfully"),
      );
    });

    it("should handle errors gracefully", async () => {
      vi.mocked(loadConfig).mockRejectedValue(new Error("Test error"));

      await configureStoryblok();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to configure Storyblok"),
      );
    });
  });
});
