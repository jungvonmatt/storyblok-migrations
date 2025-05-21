/**
 * @file migration-handlers.test.ts
 * @description Integration tests for individual migration handlers.
 *
 * This test suite focuses on testing the behavior of individual migration handlers
 * in isolation, ensuring that each handler correctly implements its specific
 * functionality and properly interacts with the Storyblok API.
 *
 * Key aspects tested:
 * 1. Individual handler behaviors (create, update, delete operations)
 * 2. Handler-specific error cases and edge conditions
 * 3. API interaction patterns for each handler type
 * 4. Data transformation and validation
 *
 * The suite is organized by handler type:
 * - Component Handlers: Testing component CRUD operations
 * - Component Group Handlers: Testing group management
 * - Story Handlers: Testing story content operations
 * - Datasource Handlers: Testing datasource and entry management
 * - Transform Entries Handler: Testing content transformation
 *
 * This suite complements migration-flow.test.ts by providing detailed coverage
 * of individual handler behaviors. While migration-flow.test.ts focuses on
 * end-to-end flows, this suite ensures each handler works correctly in isolation.
 *
 * @see migration-flow.test.ts for end-to-end flow testing
 */

import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { api } from "../../utils/api";
import {
  handleCreateComponent,
  handleUpdateComponent,
  handleDeleteComponent,
  handleCreateComponentGroup,
  handleUpdateComponentGroup,
  handleDeleteComponentGroup,
  handleCreateStory,
  handleUpdateStory,
  handleCreateDatasource,
  handleUpdateDatasource,
  handleTransformEntries,
} from "../../handlers";
import type { IComponent } from "../../types/IComponent";
import type { IDataSource } from "../../types/IDataSource";

// Mock the external API calls
vi.mock("../../utils/api", () => {
  const components = {
    getAll: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const componentGroups = {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const stories = {
    getAll: vi.fn(),
    get: vi.fn(),
    getBySlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const datasources = {
    getAll: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
  };

  const datasourceEntries = {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  return {
    // Export the api object
    api: {
      components,
      componentGroups,
      stories,
      datasources,
      datasourceEntries,
    },
    components,
    componentGroups,
    stories,
    datasources,
    datasourceEntries,
  };
});

describe("Integration Tests: Migration Handlers", () => {
  const mockComponent: IComponent = {
    name: "test-component",
    display_name: "Test Component",
    schema: {
      title: { type: "text", display_name: "Title", required: true },
    },
    created_at: "2024-01-01T00:00:00.000Z",
    id: 1,
  };

  const mockStory = {
    id: 1,
    name: "Test Story",
    slug: "test-story",
    full_slug: "test-story",
    content: {
      component: "test-component",
      title: "Test Title",
    },
    created_at: "2024-01-01T00:00:00.000Z",
    published_at: "2024-01-01T00:00:00.000Z",
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

    // Mock API responses
    (api.components.getAll as Mock).mockResolvedValue({
      data: { components: [] },
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
    (api.componentGroups.create as Mock).mockResolvedValue({
      data: { component_group: { id: 1, name: "test-group" } },
    });
    (api.componentGroups.update as Mock).mockResolvedValue({
      data: { component_group: { id: 1, name: "test-group" } },
    });
    (api.componentGroups.delete as Mock).mockResolvedValue({
      data: {},
    });

    (api.stories.getAll as Mock).mockResolvedValue({
      data: { stories: [] },
    });
    (api.stories.get as Mock).mockResolvedValue({
      data: { story: mockStory },
    });
    (api.stories.getBySlug as Mock).mockResolvedValue(mockStory);
    (api.stories.create as Mock).mockResolvedValue({
      data: { story: mockStory },
    });
    (api.stories.update as Mock).mockResolvedValue({
      data: { story: mockStory },
    });
    (api.stories.delete as Mock).mockResolvedValue({
      data: {},
    });

    (api.datasources.getAll as Mock).mockResolvedValue({
      data: { datasources: [] },
    });
    (api.datasources.get as Mock).mockResolvedValue({
      data: { datasource: mockDatasource },
    });
    (api.datasources.create as Mock).mockResolvedValue({
      data: { datasource: mockDatasource },
    });
    (api.datasources.update as Mock).mockResolvedValue({
      data: { datasource: mockDatasource },
    });
    (api.datasources.delete as Mock).mockResolvedValue({
      data: {},
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Component Handlers", () => {
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
    });

    it("should handle component update flow", async () => {
      (api.components.getAll as Mock).mockResolvedValue({
        data: { components: [mockComponent] },
      });

      await handleUpdateComponent(
        {
          schema: {
            name: "test-component",
            display_name: "Updated Component",
            schema: {
              title: { type: "text", display_name: "Title", required: true },
              description: { type: "text", display_name: "Description" },
            },
          },
        },
        { isDryrun: false },
      );

      expect(api.components.update).toHaveBeenCalled();
    });

    it("should handle component deletion flow", async () => {
      (api.components.getAll as Mock).mockResolvedValue({
        data: { components: [mockComponent] },
      });

      await handleDeleteComponent(
        { name: "test-component" },
        { isDryrun: false },
      );

      expect(api.components.delete).toHaveBeenCalled();
    });
  });

  describe("Component Group Handlers", () => {
    it("should handle component group creation flow", async () => {
      await handleCreateComponentGroup(
        {
          groups: [{ name: "test-group" }],
        },
        { isDryrun: false },
      );

      expect(api.componentGroups.create).toHaveBeenCalled();
    });

    it("should handle component group update flow", async () => {
      (api.componentGroups.getAll as Mock).mockResolvedValue({
        data: {
          component_groups: [{ id: 1, name: "test-group", uuid: "123" }],
        },
      });

      await handleUpdateComponentGroup(
        {
          id: 1,
          group: { name: "updated-group" },
        },
        { isDryrun: false },
      );

      expect(api.componentGroups.update).toHaveBeenCalled();
    });

    it("should handle component group deletion flow", async () => {
      (api.componentGroups.getAll as Mock).mockResolvedValue({
        data: {
          component_groups: [{ id: 1, name: "test-group" }],
        },
      });

      await handleDeleteComponentGroup({ id: 1 }, { isDryrun: false });

      expect(api.componentGroups.delete).toHaveBeenCalled();
    });
  });

  describe("Story Handlers", () => {
    it("should handle story creation flow", async () => {
      await handleCreateStory(
        {
          story: {
            name: "Test Story",
            content: {
              component: "test-component",
              title: "Test Title",
            },
          },
        },
        { isDryrun: false },
      );

      expect(api.stories.create).toHaveBeenCalled();
    });

    it("should handle story update flow", async () => {
      await handleUpdateStory(
        {
          id: 1,
          story: {
            name: "Updated Story",
            content: {
              component: "test-component",
              title: "Updated Title",
            },
          },
        },
        { isDryrun: false },
      );

      expect(api.stories.update).toHaveBeenCalled();
    });
  });

  describe("Datasource Handlers", () => {
    it("should handle datasource creation flow without errors", async () => {
      vi.clearAllMocks();

      // Create a spy to track if handlers log error messages
      const errorSpy = vi.spyOn(console, "error");

      (api.datasources.getAll as Mock).mockResolvedValue({
        data: { datasources: [] },
      });

      (api.datasources.has as Mock).mockResolvedValue(false);

      (api.datasources.create as Mock).mockResolvedValue({
        data: {
          datasource: mockDatasource,
        },
      });

      (api.datasourceEntries.getAll as Mock).mockResolvedValue({
        data: { datasource_entries: [] },
      });

      (api.datasourceEntries.create as Mock).mockResolvedValue({
        data: {
          datasource_entry: { id: 1, name: "Test Entry", value: "test-value" },
        },
      });

      await handleCreateDatasource(
        {
          datasource: {
            name: "Test Datasource",
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

    it("should handle datasource update flow", async () => {
      await handleUpdateDatasource(
        {
          id: 1,
          datasource: {
            name: "Updated Datasource",
          },
          entries: [
            {
              name: "Updated Entry",
              value: "updated-value",
            },
          ],
        },
        { isDryrun: false },
      );

      expect(api.datasources.update).toHaveBeenCalled();
    });
  });

  describe("Transform Entries Handler", () => {
    it("should handle transform entries flow without errors", async () => {
      vi.clearAllMocks();

      const errorSpy = vi.spyOn(console, "error");

      (api.components.getAll as Mock).mockResolvedValue({
        data: { components: [mockComponent] },
      });

      (api.components.get as Mock).mockResolvedValue({
        data: { component: mockComponent },
      });

      (api.components.update as Mock).mockResolvedValue({
        data: { component: mockComponent },
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
        data: {
          story: {
            id: 1,
            full_slug: "test-story",
            content: {
              component: "test-component",
              title: "Transformed Title",
            },
          },
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
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully in component creation", async () => {
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

    it("should handle not found errors in component update", async () => {
      (api.components.getAll as Mock).mockResolvedValue({
        data: { components: [] },
      });

      await expect(
        handleUpdateComponent(
          {
            schema: {
              name: "non-existent",
              display_name: "Non Existent",
            },
          },
          { isDryrun: false },
        ),
      ).rejects.toThrow();
    });
  });
});
