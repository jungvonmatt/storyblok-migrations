import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { run } from "../../commands/run";
import { setRequestsPerSecond } from "../../utils/api";
import * as handlers from "../../handlers";
import fs from "fs";
import path from "path";
import { RunOptions } from "../../types/migration";

// Store the mock migration object so we can update it in tests
const mockMigration = { type: "create-component" };

// Mock dependencies
vi.mock("../../utils/api");
vi.mock("../../handlers");
vi.mock("fs");
vi.mock("path");
vi.mock("jiti", () => ({
  createJiti: () => ({
    import: async () => ({ default: mockMigration }),
  }),
}));
vi.mock("picocolors", () => ({
  default: {
    green: (str: string) => str,
    red: (str: string) => str,
    blue: (str: string) => str,
    yellow: (str: string) => str,
  },
}));

describe("run", () => {
  const mockFilePath = "test-migration.ts";
  const mockResolvedPath = "/absolute/path/to/test-migration.ts";

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset migration type for each test
    mockMigration.type = "create-component";

    // Common mocks setup
    vi.mocked(path.resolve).mockReturnValue(mockResolvedPath);
    vi.mocked(fs.existsSync).mockReturnValue(true);

    // Mock process.exit
    vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`Process.exit called with code ${code}`);
    });

    // Make all handlers succeed by default
    Object.values(handlers).forEach((handler) => {
      vi.mocked(handler).mockResolvedValue(undefined);
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should set default rate limit when no throttle is provided", async () => {
    try {
      await run(mockFilePath);
    } catch {
      // Expected to throw due to process.exit
    }
    expect(setRequestsPerSecond).toHaveBeenCalledWith(3);
  });

  it("should set custom rate limit when throttle is provided", async () => {
    try {
      await run(mockFilePath, { throttle: 500 });
    } catch {
      // Expected to throw due to process.exit
    }
    expect(setRequestsPerSecond).toHaveBeenCalledWith(2);
  });

  it("should exit when migration file is not found", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
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
        mockMigration.type = type;

        try {
          await run(mockFilePath);
        } catch {
          // Expected to throw due to process.exit
        }

        expect(handler).toHaveBeenCalledWith(
          { type },
          {
            isDryrun: undefined,
            publish: undefined,
            publishLanguages: undefined,
          },
        );
      });
    });
  });

  it("should pass options to migration handlers", async () => {
    const options: RunOptions = {
      dryRun: true,
      publish: "all",
      languages: "en,de",
      throttle: 1000,
    };

    try {
      await run(mockFilePath, options);
    } catch {
      // Expected to throw due to process.exit
    }

    expect(handlers.handleCreateComponent).toHaveBeenCalledWith(
      { type: "create-component" },
      {
        isDryrun: true,
        publish: "all",
        publishLanguages: "en,de",
      },
    );
  });

  it("should handle unknown migration types", async () => {
    mockMigration.type = "unknown-type";

    await expect(run(mockFilePath)).rejects.toThrow(
      "Process.exit called with code 1",
    );
  });
});
