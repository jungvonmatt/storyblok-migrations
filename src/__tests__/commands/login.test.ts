import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  loginToStoryblok,
  isStoryblokCliInstalled,
} from "../../commands/login";
import { loadConfig } from "../../utils/config";
import { execSync, spawnSync } from "child_process";
import type { StoryblokConfig, StoryblokRegion } from "../../types/config";

vi.mock("../../utils/config");
vi.mock("child_process");
vi.mock("picocolors", () => ({
  default: {
    green: vi.fn((str) => str),
    red: vi.fn((str) => str),
    blue: vi.fn((str) => str),
  },
}));

describe("login command", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    processExitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((code?: string | number | null) => {
        throw new Error(`process.exit(${code})`);
      }) as unknown as ReturnType<typeof vi.spyOn>;
    vi.resetAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe("isStoryblokCliInstalled", () => {
    it("should return true when Storyblok CLI is installed", () => {
      vi.mocked(spawnSync).mockReturnValue({
        status: 0,
        stdout: Buffer.from(""),
        stderr: Buffer.from(""),
        output: ["", "", ""],
        pid: 0,
        signal: null,
      });

      expect(isStoryblokCliInstalled()).toBe(true);
      expect(spawnSync).toHaveBeenCalledWith("storyblok", ["--version"]);
    });

    it("should return false when Storyblok CLI is not installed", () => {
      vi.mocked(spawnSync).mockReturnValue({
        status: 1,
        stdout: Buffer.from(""),
        stderr: Buffer.from(""),
        output: ["", "", ""],
        pid: 0,
        signal: null,
      });

      expect(isStoryblokCliInstalled()).toBe(false);
      expect(spawnSync).toHaveBeenCalledWith("storyblok", ["--version"]);
    });
  });

  describe("loginToStoryblok", () => {
    it("should login successfully when CLI is installed and config exists", async () => {
      const mockConfig = {
        spaceId: "test-space",
        oauthToken: "test-token",
        region: "eu" as StoryblokRegion,
      };

      vi.mocked(loadConfig).mockResolvedValue(mockConfig);
      vi.mocked(spawnSync).mockReturnValue({
        status: 0,
        stdout: Buffer.from(""),
        stderr: Buffer.from(""),
        output: ["", "", ""],
        pid: 0,
        signal: null,
      });

      await loginToStoryblok();

      expect(execSync).toHaveBeenCalledWith(
        "storyblok login --token test-token --region eu",
        { stdio: "inherit" },
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Logging in to Storyblok"),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Successfully logged in to Storyblok"),
      );
    });

    it("should handle missing CLI installation", async () => {
      vi.mocked(spawnSync).mockReturnValue({
        status: 1,
        stdout: Buffer.from(""),
        stderr: Buffer.from(""),
        output: ["", "", ""],
        pid: 0,
        signal: null,
      });

      await expect(loginToStoryblok()).rejects.toThrow(
        "process.exit unexpectedly called with",
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Storyblok CLI not found"),
      );
    });

    it("should handle missing OAuth token", async () => {
      vi.mocked(spawnSync).mockReturnValue({
        status: 0,
        stdout: Buffer.from(""),
        stderr: Buffer.from(""),
        output: ["", "", ""],
        pid: 0,
        signal: null,
      });
      vi.mocked(loadConfig).mockResolvedValue({} as StoryblokConfig);

      await expect(loginToStoryblok()).rejects.toThrow(
        "process.exit unexpectedly called with",
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("No Storyblok OAuth token found"),
      );
    });

    it("should handle login failure", async () => {
      const mockConfig = {
        spaceId: "test-space",
        oauthToken: "test-token",
        region: "eu" as StoryblokRegion,
      };

      vi.mocked(loadConfig).mockResolvedValue(mockConfig);
      vi.mocked(spawnSync).mockReturnValue({
        status: 0,
        stdout: Buffer.from(""),
        stderr: Buffer.from(""),
        output: ["", "", ""],
        pid: 0,
        signal: null,
      });
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error("Login failed");
      });

      await expect(loginToStoryblok()).rejects.toThrow(
        "process.exit unexpectedly called with",
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to login to Storyblok"),
      );
    });
  });
});
