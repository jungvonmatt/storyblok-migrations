/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  loadConfig,
  loadEnvConfig,
  saveConfig,
  verifyExistingConfig,
  promptForConfig,
} from "../../utils/config";
import { writeFile } from "fs/promises";
import { config } from "dotenv";
import { cosmiconfig } from "cosmiconfig";
import { StoryblokRegion } from "../../types/config";
import { confirm, input, select } from "@inquirer/prompts";

vi.mock("fs/promises");
vi.mock("dotenv");
vi.mock("cosmiconfig");
vi.mock("@inquirer/prompts");
vi.mock("picocolors", () => ({
  default: {
    green: vi.fn((str) => str),
    red: vi.fn((str) => str),
    blue: vi.fn((str) => str),
    yellow: vi.fn((str) => str),
  },
}));

describe("config utils", () => {
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
        region: "eu" as StoryblokRegion,
      };

      await saveConfig(testConfig);

      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining(".storyblokrc.json"),
        JSON.stringify(testConfig, null, 2),
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
        region: "eu" as StoryblokRegion,
      };

      vi.mocked(cosmiconfig).mockReturnValue({
        search: () => Promise.resolve({ config: testConfig }),
      } as any);

      const result = await loadConfig();
      expect(result).toEqual(testConfig);
    });
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

      const mockSelect = Promise.resolve("eu") as Promise<string> & {
        cancel: () => void;
      };
      mockSelect.cancel = () => {};
      vi.mocked(select).mockImplementation(() => mockSelect);

      const result = await verifyExistingConfig({ spaceId: "existing-space" });

      expect(result).toEqual({
        spaceId: "existing-space",
        oauthToken: "test-value",
        region: "eu",
      });
    });
  });

  describe("promptForConfig", () => {
    it("should prompt for all values with defaults", async () => {
      vi.mocked(input).mockImplementation(({ message }) => {
        const mockInput = Promise.resolve(
          message.includes("Space ID") ? "new-space" : "new-token",
        ) as Promise<string> & { cancel: () => void };
        mockInput.cancel = () => {};
        return mockInput;
      });

      const mockSelect = Promise.resolve("eu") as Promise<string> & {
        cancel: () => void;
      };
      mockSelect.cancel = () => {};
      vi.mocked(select).mockImplementation(() => mockSelect);

      const result = await promptForConfig({ spaceId: "old-space" });

      expect(result).toEqual({
        spaceId: "new-space",
        oauthToken: "new-token",
        region: "eu",
      });
    });
  });
});
