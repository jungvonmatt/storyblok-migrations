import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateTypes } from "../../commands/generate-types";
import { loadConfig } from "../../utils/config";
import storyblokToTypescript from "storyblok-generate-ts";
import { StoryblokConfig } from "../../types/config";
import * as fs from "fs";
import * as path from "path";

vi.mock("../../utils/config");
vi.mock("storyblok-generate-ts");
vi.mock("fs");
vi.mock("path");

describe("generate-types command", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
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
  });

  it("should handle missing space ID", async () => {
    vi.mocked(loadConfig).mockResolvedValue({} as StoryblokConfig);

    await expect(generateTypes()).rejects.toThrow(
      "process.exit unexpectedly called with",
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
