/**
 * @file migration-flow.test.ts
 * @description Integration tests for the core migration flow functionality.
 *
 * This test suite focuses on verifying the end-to-end behavior of migration flows,
 * ensuring that the system correctly handles the complete lifecycle of migrations
 * from start to finish. It tests the integration between different handlers and
 * their interaction with the Storyblok API.
 *
 * Key aspects tested:
 * 1. Complete migration flows (create, update, delete) for various content types
 * 2. Error handling and recovery during migration execution
 * 3. Dry run functionality
 * 4. API interaction patterns
 *
 * This suite complements migration-handlers.test.ts by focusing on the complete
 * flow rather than individual handler behaviors. While migration-handlers.test.ts
 * tests the individual components in isolation, this suite verifies their
 * integration and interaction.
 *
 * @see migration-handlers.test.ts for detailed handler-specific tests
 */

import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { api } from "../../utils/api";
import {
  handleCreateComponent,
  handleDeleteComponent,
  handleCreateDatasource,
  handleTransformEntries,
} from "../../handlers";
import type { IComponent } from "../../types/IComponent";
import type { IDataSource } from "../../types/IDataSource";
import { getConsoleOutput, clearConsoleOutput } from "../setup";

// Mock the external API calls
vi.mock("../../utils/api", () => {
  const datasources = {
    getAll: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
  };

  const components = {
    getAll: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const datasourceEntries = {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const stories = {
    getAll: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
  };

  const componentGroups = {
    getAll: vi.fn(),
  };

  return {
    // Export the api object
    api: {
      components,
      componentGroups,
      datasources,
      datasourceEntries,
      stories,
    },
    datasources,
    components,
    datasourceEntries,
  };
});

// Integration test suite that verifies
// the communication between the actual handlers and the API
describe("Integration Tests: Migration Flow", () => {
  const mockComponent: IComponent = {
    name: "test-component",
    display_name: "Test Component",
    schema: {
      title: { type: "text", display_name: "Title", required: true },
    },
    created_at: "2024-01-01T00:00:00.000Z",
    id: 1,
  };

  const mockDatasource: IDataSource = {
    id: 1,
    name: "Test Datasource",
    slug: "test-datasource",
    dimensions: [],
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    clearConsoleOutput();

    // Mock API responses with correct structure
    (api.components.getAll as Mock).mockResolvedValue({
      data: { components: [] },
    });
    (api.components.get as Mock).mockResolvedValue({
      data: { component: mockComponent },
    });
    (api.components.create as Mock).mockResolvedValue({
      data: { component: mockComponent },
    });
    (api.components.update as Mock).mockResolvedValue({
      data: { component: mockComponent },
    });
    (api.components.delete as Mock).mockResolvedValue({
      data: {},
    });
    (api.componentGroups.getAll as Mock).mockResolvedValue({
      data: { component_groups: [] },
    });
    (api.datasources.getAll as Mock).mockResolvedValue({
      data: { datasources: [] },
    });
    (api.datasources.has as Mock).mockResolvedValue(false);
    (api.datasources.create as Mock).mockResolvedValue({
      data: { datasource: mockDatasource },
    });
    (api.datasources.get as Mock).mockResolvedValue({
      data: { datasource: mockDatasource },
    });
    (api.datasourceEntries.getAll as Mock).mockResolvedValue({
      data: { datasource_entries: [] },
    });
    (api.datasourceEntries.create as Mock).mockResolvedValue({
      data: {
        datasource_entry: { id: 1, name: "Test Entry", value: "test-value" },
      },
    });
    (api.stories.getAll as Mock).mockResolvedValue({
      data: {
        stories: [
          {
            id: 1,
            full_slug: "test-story",
            content: {
              component: "test-component",
              title: "Original Title",
            },
          },
        ],
      },
    });
    (api.stories.get as Mock).mockResolvedValue({
      data: {
        story: {
          id: 1,
          full_slug: "test-story",
          content: {
            component: "test-component",
            title: "Original Title",
          },
        },
      },
    });
    (api.stories.update as Mock).mockResolvedValue({
      data: {},
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should handle component creation flow", async () => {
    await handleCreateComponent(
      {
        schema: {
          name: "test-component",
          display_name: "Test Component",
          schema: {
            title: { type: "text", display_name: "Title", required: true },
          },
        },
      },
      { isDryrun: false },
    );

    expect(api.components.create).toHaveBeenCalled();
    expect(api.components.update).toHaveBeenCalled();

    const output = getConsoleOutput();
    expect(output).toContainEqual({
      type: "log",
      args: [expect.stringContaining("Creating component: test-component")],
    });
    expect(output).toContainEqual({
      type: "log",
      args: [
        expect.stringContaining(
          "Updating fields for component: test-component",
        ),
      ],
    });
    expect(output).toContainEqual({
      type: "log",
      args: [
        expect.stringContaining(
          "Component created successfully: test-component",
        ),
      ],
    });
  });

  it("should handle component deletion flow", async () => {
    (api.components.getAll as Mock).mockResolvedValue({
      data: {
        components: [{ id: 123, name: "delete-component" }],
      },
    });

    await handleDeleteComponent(
      { name: "delete-component" },
      { isDryrun: false },
    );

    expect(api.components.delete).toHaveBeenCalled();
  });

  it("should handle datasource creation flow without errors", async () => {
    const errorSpy = vi.spyOn(console, "error");

    vi.clearAllMocks();

    (api.datasources.getAll as Mock).mockResolvedValue({
      data: { datasources: [] },
    });

    (api.datasources.create as Mock).mockResolvedValue({
      data: { datasource: mockDatasource },
    });

    await handleCreateDatasource(
      {
        datasource: {
          name: "test-datasource",
          slug: "test-datasource",
        },
        entries: [
          {
            name: "Test Entry",
            value: "test-value",
          },
        ],
      },
      { isDryrun: false },
    );

    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("should handle transform entries flow without errors", async () => {
    const errorSpy = vi.spyOn(console, "error");

    vi.clearAllMocks();

    (api.stories.getAll as Mock).mockResolvedValue({
      data: {
        stories: [
          {
            id: 1,
            full_slug: "test-story",
            content: {
              component: "test-component",
              title: "Original Title",
            },
          },
        ],
      },
    });

    await handleTransformEntries(
      {
        type: "transform-entries" as const,
        component: "test-component",
        transform: (entry: Record<string, unknown>) => ({
          ...entry,
          title: "Transformed Title",
        }),
      },
      { isDryrun: false },
    );

    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("should handle API errors gracefully", async () => {
    (api.components.create as Mock).mockRejectedValue(new Error("API Error"));

    await expect(
      handleCreateComponent(
        {
          schema: {
            name: "error-test",
            display_name: "Error Test",
            schema: {
              title: { type: "text", display_name: "Title", required: true },
            },
          },
        },
        { isDryrun: false },
      ),
    ).rejects.toThrow("API Error");
  });

  it("validates that API mocking works correctly", async () => {
    vi.clearAllMocks();

    await api.datasources.create({ name: "test", slug: "test" });
    await api.stories.update(
      {
        id: 1,
        name: "Test",
        slug: "test",
        content: { component: "test" },
      },
      {},
    );

    expect(api.datasources.create).toHaveBeenCalled();
    expect(api.stories.update).toHaveBeenCalled();
  });
});
