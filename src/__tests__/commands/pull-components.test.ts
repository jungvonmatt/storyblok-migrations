import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { pullComponents } from "../../commands/pull-components";
import { loadConfig } from "../../utils/config";
import { isStoryblokCliInstalled } from "../../commands/login";
import { execSync } from "child_process";

// Mock dependencies
vi.mock("../../utils/config");
vi.mock("../../commands/login");
vi.mock("child_process");
vi.mock("picocolors", () => ({
  default: {
    green: vi.fn((str) => str),
    red: vi.fn((str) => str),
    blue: vi.fn((str) => str),
  },
}));

describe("pullComponents", () => {
  const mockSpaceId = "12345";
  const mockConfig = { spaceId: mockSpaceId };

  beforeEach(() => {
    vi.clearAllMocks();
    (isStoryblokCliInstalled as Mock).mockReturnValue(true);
    (loadConfig as Mock).mockResolvedValue(mockConfig);
    (execSync as Mock).mockReturnValue(Buffer.from(""));
    // Mock process.exit to throw an error instead of exiting
    vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`Process.exit called with code ${code}`);
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should successfully pull components when all requirements are met", async () => {
    // Act & Assert
    await pullComponents();
    expect(isStoryblokCliInstalled).toHaveBeenCalled();
    expect(loadConfig).toHaveBeenCalled();
    expect(execSync).toHaveBeenCalledWith(
      `storyblok pull-components --space ${mockSpaceId}`,
      { stdio: "inherit" },
    );
  });

  it("should exit with error when Storyblok CLI is not installed", async () => {
    // Arrange
    (isStoryblokCliInstalled as Mock).mockReturnValue(false);

    // Act & Assert
    await expect(pullComponents()).rejects.toThrow(
      "Process.exit called with code 1",
    );
    expect(loadConfig).not.toHaveBeenCalled();
    expect(execSync).not.toHaveBeenCalled();
  });

  it("should exit with error when no Space ID is found in config", async () => {
    // Arrange
    (loadConfig as Mock).mockResolvedValue({});

    // Act & Assert
    await expect(pullComponents()).rejects.toThrow(
      "Process.exit called with code 1",
    );
    expect(execSync).not.toHaveBeenCalled();
  });

  it("should exit with error when component pull operation fails", async () => {
    // Arrange
    const mockError = new Error("Pull failed");
    (execSync as Mock).mockImplementation(() => {
      throw mockError;
    });

    // Act & Assert
    await expect(pullComponents()).rejects.toThrow(
      "Process.exit called with code 1",
    );
  });

  it("should handle config loading errors gracefully", async () => {
    // Arrange
    (loadConfig as Mock).mockRejectedValue(new Error("Config error"));

    // Act & Assert
    await expect(pullComponents()).rejects.toThrow(
      "Process.exit called with code 1",
    );
    expect(execSync).not.toHaveBeenCalled();
  });
});
