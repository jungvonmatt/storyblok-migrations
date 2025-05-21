import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateTypes } from "../../commands/generate-types";
import { loadConfig } from "../../utils/config";
import fs from "fs";
import path from "path";
import storyblokToTypescript from "storyblok-generate-ts";
import type { StoryblokConfig } from "../../types/config";

vi.mock("../../utils/config");
vi.mock("fs");
vi.mock("path");
vi.mock("storyblok-generate-ts");
vi.mock("picocolors", () => ({
  default: {
    green: vi.fn((str) => str),
    red: vi.fn((str) => str),
    blue: vi.fn((str) => str),
  },
}));

describe("generate-types command", () => {
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

    vi.spyOn(process, "cwd").mockReturnValue("/test/cwd");

    vi.mocked(path.join).mockImplementation((...args: string[]) => {
      if (args.length === 0) return "";
      return args.join("/");
    });

    vi.mocked(fs.existsSync).mockImplementation((path: fs.PathLike) => {
      const pathStr = path.toString();
      if (pathStr.includes("components.")) return true;
      if (pathStr.includes("storyblok/types")) return true;
      return false;
    });

    vi.mocked(fs.readFileSync).mockImplementation(
      (path: fs.PathOrFileDescriptor) => {
        const pathStr = path.toString();
        if (pathStr.includes("components.")) {
          return JSON.stringify({
            components: [
              {
                name: "test_component",
                fields: [
                  {
                    name: "test_field",
                    field_type: "text",
                  },
                ],
              },
            ],
          });
        }
        return "";
      },
    );

    vi.mocked(fs.writeFileSync).mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  it("should generate types successfully", async () => {
    const mockConfig: StoryblokConfig = {
      spaceId: "test-space",
      oauthToken: "test-token",
      region: "eu",
    };

    vi.mocked(loadConfig).mockResolvedValue(mockConfig);
    vi.mocked(storyblokToTypescript).mockResolvedValue([]);

    await generateTypes();

    expect(storyblokToTypescript).toHaveBeenCalledWith(
      expect.objectContaining({
        componentsJson: expect.any(Object),
        path: expect.stringContaining("storyblok/types/storyblok.gen.d.ts"),
        titlePrefix: "Sb",
        titleSuffix: "",
      }),
    );

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("Generating TypeScript types"),
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("Successfully generated TypeScript types"),
    );
  });

  it("should handle missing space ID", async () => {
    vi.mocked(loadConfig).mockResolvedValue({} as StoryblokConfig);

    await expect(generateTypes()).rejects.toThrow(
      "process.exit unexpectedly called with",
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("No Storyblok Space ID found"),
    );
  });

  it("should handle missing components schema file", async () => {
    const mockConfig: StoryblokConfig = {
      spaceId: "test-space",
      oauthToken: "test-token",
      region: "eu",
    };

    vi.mocked(loadConfig).mockResolvedValue(mockConfig);
    vi.mocked(fs.existsSync).mockImplementation(() => false);

    await expect(generateTypes()).rejects.toThrow(
      "process.exit unexpectedly called with",
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Components schema file not found"),
    );
  });

  it("should handle type generation errors", async () => {
    const mockConfig: StoryblokConfig = {
      spaceId: "test-space",
      oauthToken: "test-token",
      region: "eu",
    };

    vi.mocked(loadConfig).mockResolvedValue(mockConfig);
    vi.mocked(storyblokToTypescript).mockRejectedValue(
      new Error("Generation failed"),
    );

    await expect(generateTypes()).rejects.toThrow(
      "process.exit unexpectedly called with",
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to generate TypeScript types"),
    );
  });

  it("should create output directory if it doesn't exist", async () => {
    const mockConfig: StoryblokConfig = {
      spaceId: "test-space",
      oauthToken: "test-token",
      region: "eu",
    };

    vi.mocked(loadConfig).mockResolvedValue(mockConfig);
    vi.mocked(fs.existsSync).mockImplementation((path: fs.PathLike) => {
      const pathStr = path.toString();
      if (pathStr.includes("components.")) return true;
      if (pathStr.includes("storyblok/types")) return false;
      return true;
    });

    await generateTypes();

    expect(fs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining("storyblok/types"),
      { recursive: true },
    );
  });
});
