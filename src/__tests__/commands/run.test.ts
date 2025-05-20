import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { run } from "../../commands/run";
import { setRequestsPerSecond } from "../../utils/api";
import * as handlers from "../../handlers";
import fs from "fs";
import path from "path";
import { RunOptions } from "../../types/migration";

// Mock dependencies
vi.mock("../../utils/api");
vi.mock("../../handlers");
vi.mock("fs");
vi.mock("path");
vi.mock("picocolors", () => ({
  default: {
    green: vi.fn((str) => str),
    red: vi.fn((str) => str),
    blue: vi.fn((str) => str),
    yellow: vi.fn((str) => str),
  },
}));

describe("run", () => {
  const mockFilePath = "test-migration.ts";
  const mockResolvedPath = "/absolute/path/to/test-migration.ts";

  beforeEach(() => {
    vi.clearAllMocks();
    (path.resolve as Mock).mockReturnValue(mockResolvedPath);
    (fs.existsSync as Mock).mockReturnValue(true);

    // Mock process.exit to throw an error
    vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`Process.exit called with code ${code}`);
    });

    // Mock all handlers to throw an error
    Object.values(handlers).forEach((handler) => {
      if (typeof handler === "function") {
        (handler as Mock).mockRejectedValue(new Error("Handler error"));
      }
    });

    // Mock dynamic import
    vi.doMock(mockResolvedPath, () => ({
      default: { type: "create-component" },
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should set default rate limit when no throttle is provided", async () => {
    // Act & Assert
    await expect(run(mockFilePath)).rejects.toThrow(
      "Process.exit called with code 1",
    );
    expect(setRequestsPerSecond).toHaveBeenCalledWith(3);
  });

  it("should set custom rate limit when throttle is provided", async () => {
    // Act & Assert
    await expect(run(mockFilePath, { throttle: 500 })).rejects.toThrow(
      "Process.exit called with code 1",
    );
    expect(setRequestsPerSecond).toHaveBeenCalledWith(2);
  });

  it("should exit when migration file is not found", async () => {
    // Arrange
    (fs.existsSync as Mock).mockReturnValue(false);

    // Act & Assert
    await expect(run(mockFilePath)).rejects.toThrow(
      "Process.exit called with code 1",
    );
  });

  it("should handle migration file import errors", async () => {
    // Arrange
    vi.doMock(mockResolvedPath, () => {
      throw new Error("Import error");
    });

    // Act & Assert
    await expect(run(mockFilePath)).rejects.toThrow(
      "Process.exit called with code 1",
    );
  });

  it("should handle unknown migration types", async () => {
    // Arrange
    vi.doMock(mockResolvedPath, () => ({
      default: { type: "unknown-type" },
    }));

    // Act & Assert
    await expect(run(mockFilePath)).rejects.toThrow(
      "Process.exit called with code 1",
    );
  });

  describe("migration type handling", () => {
    const testCases = [
      {
        type: "create-component-group",
        handler: handlers.handleCreateComponentGroup,
      },
      {
        type: "update-component-group",
        handler: handlers.handleUpdateComponentGroup,
      },
      {
        type: "delete-component-group",
        handler: handlers.handleDeleteComponentGroup,
      },
      {
        type: "create-component",
        handler: handlers.handleCreateComponent,
      },
      {
        type: "update-component",
        handler: handlers.handleUpdateComponent,
      },
      {
        type: "delete-component",
        handler: handlers.handleDeleteComponent,
      },
      {
        type: "create-story",
        handler: handlers.handleCreateStory,
      },
      {
        type: "update-story",
        handler: handlers.handleUpdateStory,
      },
      {
        type: "delete-story",
        handler: handlers.handleDeleteStory,
      },
      {
        type: "create-datasource",
        handler: handlers.handleCreateDatasource,
      },
      {
        type: "update-datasource",
        handler: handlers.handleUpdateDatasource,
      },
      {
        type: "delete-datasource",
        handler: handlers.handleDeleteDatasource,
      },
      {
        type: "transform-entries",
        handler: handlers.handleTransformEntries,
      },
    ];

    testCases.forEach(({ type, handler }) => {
      it(`should call ${handler.name} for ${type} migration`, async () => {
        // Arrange
        const mockMigration = { type };
        vi.doMock(mockResolvedPath, () => ({
          default: mockMigration,
        }));

        // Act & Assert
        await expect(run(mockFilePath)).rejects.toThrow(
          "Process.exit called with code 1",
        );
        expect(handler).toHaveBeenCalledWith(mockMigration, {
          isDryrun: undefined,
          publish: undefined,
          publishLanguages: undefined,
        });
      });
    });
  });

  it("should pass options to migration handlers", async () => {
    // Arrange
    const mockMigration = { type: "create-component" };
    const options: RunOptions = {
      dryRun: true,
      publish: "all",
      languages: "en,de",
      throttle: 1000,
    };
    vi.doMock(mockResolvedPath, () => ({
      default: mockMigration,
    }));

    // Act & Assert
    await expect(run(mockFilePath, options)).rejects.toThrow(
      "Process.exit called with code 1",
    );
    expect(handlers.handleCreateComponent).toHaveBeenCalledWith(mockMigration, {
      isDryrun: true,
      publish: "all",
      publishLanguages: "en,de",
    });
  });

  it("should handle migration handler errors", async () => {
    // Arrange
    const mockMigration = { type: "create-component" };
    vi.doMock(mockResolvedPath, () => ({
      default: mockMigration,
    }));

    // Act & Assert
    await expect(run(mockFilePath)).rejects.toThrow(
      "Process.exit called with code 1",
    );
  });
});
