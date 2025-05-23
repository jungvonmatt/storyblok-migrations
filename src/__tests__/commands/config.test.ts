import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStoryblok } from "../../commands/config";
import {
  loadConfig,
  loadEnvConfig,
  saveConfig,
  verifyExistingConfig,
} from "../../utils/config";
import { StoryblokRegion } from "../../types/config";

vi.mock("../../utils/config");
vi.mock("../../utils/api");

describe("config command", () => {
  beforeEach(() => {
    vi.resetAllMocks();
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
    });

    it("should handle errors gracefully", async () => {
      vi.mocked(loadConfig).mockRejectedValue(new Error("Test error"));

      await configureStoryblok();
    });
  });
});
