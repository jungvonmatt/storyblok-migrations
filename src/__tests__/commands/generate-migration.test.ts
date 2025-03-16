/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateMigration } from "../../commands/generate-migration";
import fs from "fs";
import path from "path";
import { select, input } from "@inquirer/prompts";

vi.mock("fs");
vi.mock("path");
vi.mock("@inquirer/prompts");
vi.mock("picocolors", () => ({
  default: {
    green: vi.fn((str) => str),
    red: vi.fn((str) => str),
  },
}));

// Mock template content
const SCHEMA_TEMPLATE = `import StoryblokClient from "storyblok-js-client";

/**
 * Schema migration: {{migrationName}}
 *
 * This migration modifies component schemas in Storyblok.
 */
export default async function (client: StoryblokClient) {
  // Template content
  console.log("Schema migration completed");
}`;

const CONTENT_TEMPLATE = `import StoryblokClient from "storyblok-js-client";

/**
 * Content migration: {{migrationName}}
 *
 * This migration modifies content entries in Storyblok.
 */
export default async function (client: StoryblokClient) {
  // Template content
  console.log("Content migration completed");
}`;

describe("generate-migration command", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    processExitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((_code?: string | number | null | undefined) => {
        throw new Error("process.exit called");
      }) as unknown as ReturnType<typeof vi.spyOn>;

    // Mock file system operations
    vi.mocked(fs.existsSync).mockImplementation((path) => {
      // Return true for template paths to simulate that they exist
      const pathStr = String(path);
      if (pathStr.includes("templates") && pathStr.includes("migration.ts")) {
        return true;
      }
      // Return false for directories to ensure they get created
      return false;
    });

    vi.mocked(fs.readFileSync).mockImplementation((path) => {
      const pathStr = String(path);
      if (pathStr.includes("schema-migration.ts")) {
        return SCHEMA_TEMPLATE;
      } else if (pathStr.includes("content-migration.ts")) {
        return CONTENT_TEMPLATE;
      }
      throw new Error(`Unexpected file read: ${pathStr}`);
    });

    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    vi.mocked(path.join).mockImplementation((...args) => args.join("/"));

    const mockSelect = Promise.resolve("schema") as Promise<string> & {
      cancel: () => void;
    };
    mockSelect.cancel = () => {};
    vi.mocked(select).mockImplementation(() => mockSelect);

    const mockInput = Promise.resolve("test-migration") as Promise<string> & {
      cancel: () => void;
    };
    mockInput.cancel = () => {};
    vi.mocked(input).mockImplementation(() => mockInput);

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-01-01T12:00:00Z"));
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
    vi.useRealTimers();
  });

  it("should create a schema migration file", async () => {
    await generateMigration();

    expect(fs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining("migrations/schema"),
      expect.any(Object)
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("20230101120000-test-migration.ts"),
      expect.stringContaining("Schema migration: test-migration")
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("Migration created")
    );
  });

  it("should create a content migration file", async () => {
    const mockSelect = Promise.resolve("content") as Promise<string> & {
      cancel: () => void;
    };
    mockSelect.cancel = () => {};
    vi.mocked(select).mockImplementationOnce(() => mockSelect);

    await generateMigration();

    expect(fs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining("migrations/content"),
      expect.any(Object)
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("20230101120000-test-migration.ts"),
      expect.stringContaining("Content migration: test-migration")
    );
  });

  it("should handle errors", async () => {
    vi.mocked(fs.mkdirSync).mockImplementation(() => {
      throw new Error("Test error");
    });

    await expect(generateMigration()).rejects.toThrow("process.exit called");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to generate migration")
    );
  });
});
