/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loadConfig, loadEnvConfig, saveConfig } from "../../utils/config";
import { writeFile } from "fs/promises";
import { config } from "dotenv";
import { cosmiconfig } from "cosmiconfig";

vi.mock("fs/promises");
vi.mock("dotenv");
vi.mock("cosmiconfig");

describe("config utils", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("loadEnvConfig", () => {
    it("should load environment variables", async () => {
      process.env.STORYBLOK_SPACE_ID = "test-space";
      process.env.STORYBLOK_OAUTH_TOKEN = "test-token";

      const result = await loadEnvConfig();

      expect(config).toHaveBeenCalled();
      expect(result).toEqual({
        spaceId: "test-space",
        oauthToken: "test-token",
      });

      delete process.env.STORYBLOK_SPACE_ID;
      delete process.env.STORYBLOK_OAUTH_TOKEN;
    });
  });

  describe("saveConfig", () => {
    it("should save config to file", async () => {
      const testConfig = {
        spaceId: "test-space",
        oauthToken: "test-token",
      };

      await saveConfig(testConfig);

      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining(".storyblokrc.json"),
        JSON.stringify(testConfig, null, 2)
      );
    });
  });

  describe("loadConfig", () => {
    it("should return null when no config is found", async () => {
      vi.mocked(cosmiconfig).mockReturnValue({
        search: () => Promise.resolve(null),
      } as any);

      const result = await loadConfig();
      expect(result).toBeNull();
    });

    it("should return config when found", async () => {
      const testConfig = {
        spaceId: "test-space",
        oauthToken: "test-token",
      };

      vi.mocked(cosmiconfig).mockReturnValue({
        search: () => Promise.resolve({ config: testConfig }),
      } as any);

      const result = await loadConfig();
      expect(result).toEqual(testConfig);
    });
  });
});
