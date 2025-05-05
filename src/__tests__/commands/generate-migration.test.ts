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
    yellow: vi.fn((str) => str),
  },
}));

// Mock some of the migration templates
const SCHEMA_TEMPLATE = `import { defineMigration } from "sb-migrate";

export default defineMigration({
  type: "{{migrationType}}",
  description: "{{migrationName}}",
  // Schema migration template content
});`;

const CONTENT_TEMPLATE = `import { defineMigration } from "sb-migrate";

export default defineMigration({
  type: "{{migrationType}}",
  description: "{{migrationName}}",
  // Content migration template content
});`;

const CREATE_COMPONENT_TEMPLATE = `import { defineMigration, textField, customField } from "sb-migrate";

export default defineMigration({
  type: "create-component",
  description: "{{migrationName}}",
  schema: {
    name: "{{migrationName}}",
    display_name: "Example Component",
    // Component definition
  }
});`;

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
      const pathStr = String(path);
      if (pathStr.includes("templates") && pathStr.includes(".js")) {
        return true;
      }
      return false;
    });

    vi.mocked(fs.readFileSync).mockImplementation((path) => {
      const pathStr = String(path);
      if (pathStr.includes("schema-migration.js")) {
        return SCHEMA_TEMPLATE;
      } else if (pathStr.includes("content-migration.js")) {
        return CONTENT_TEMPLATE;
      } else if (pathStr.includes("create-component.js")) {
        return CREATE_COMPONENT_TEMPLATE;
      } else if (pathStr.includes("migration.js")) {
        // For any other migration type, return appropriate template
        return pathStr.includes("schema") ? SCHEMA_TEMPLATE : CONTENT_TEMPLATE;
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

    const mockTypeSelect = Promise.resolve(
      "create-component",
    ) as Promise<string> & {
      cancel: () => void;
    };
    mockTypeSelect.cancel = () => {};
    vi.mocked(select)
      .mockImplementationOnce(() => mockSelect)
      .mockImplementationOnce(() => mockTypeSelect);

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
      expect.any(Object),
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("20230101120000-test-migration.js"),
      expect.stringContaining('description: "test-migration"'),
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("Migration created"),
    );
  });

  it("should create a content migration file", async () => {
    vi.mocked(select).mockReset();

    const mockCategorySelect = Promise.resolve("content") as Promise<string> & {
      cancel: () => void;
    };
    mockCategorySelect.cancel = () => {};

    const mockTypeSelect = Promise.resolve(
      "create-story",
    ) as Promise<string> & {
      cancel: () => void;
    };
    mockTypeSelect.cancel = () => {};

    vi.mocked(select)
      .mockImplementationOnce(() => mockCategorySelect)
      .mockImplementationOnce(() => mockTypeSelect);

    await generateMigration();

    expect(fs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining("migrations/content"),
      expect.any(Object),
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("20230101120000-test-migration.js"),
      expect.stringContaining('description: "test-migration"'),
    );
  });

  it("should handle errors", async () => {
    vi.mocked(fs.mkdirSync).mockImplementation(() => {
      throw new Error("Test error");
    });

    await expect(generateMigration()).rejects.toThrow("process.exit called");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to generate migration"),
    );
  });

  it("should use provided type and name options without prompting", async () => {
    vi.mocked(select).mockClear();
    vi.mocked(input).mockClear();

    await generateMigration({
      type: "create-component",
      name: "cli-option-test",
    });

    // Verify the prompts were not called
    expect(select).not.toHaveBeenCalled();
    expect(input).not.toHaveBeenCalled();

    // Verify the correct migration was created
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining("migrations/schema"),
      expect.any(Object),
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("20230101120000-cli-option-test.js"),
      expect.any(String),
    );
  });

  it("should validate the type option and exit on invalid type", async () => {
    await expect(generateMigration({ type: "invalid-type" })).rejects.toThrow(
      "process.exit called",
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Invalid migration type: invalid-type"),
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
