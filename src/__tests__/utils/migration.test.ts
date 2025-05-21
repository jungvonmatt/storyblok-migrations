import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isStoryPublishedWithoutChanges,
  isStoryWithUnpublishedChanges,
  runMigration,
  showMigrationChanges,
  defineMigration,
  Component,
  helper,
} from "../../utils/migration";
import { api } from "../../utils/api";
import { IStory } from "../../types/stories";
import type { Mock } from "vitest";
import { IComponent, IComponentSchemaItem } from "../../types/IComponent";
import { processMigration } from "../../utils/storyblok";

// Mock dependencies
vi.mock("../../utils/api", () => ({
  api: {
    stories: {
      getAll: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
    },
    components: {
      create: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("../../utils/storyblok", () => ({
  processMigration: vi.fn(),
  createRollbackFile: vi.fn(),
  addOrUpdateDatasource: vi.fn(),
  addOrUpdateFields: vi.fn((instance, fields) => ({
    ...instance,
    schema: fields,
  })),
  moveToTab: vi.fn((instance, name, keys) => ({
    ...instance,
    schema: {
      ...instance.schema,
      [name]: keys,
    },
  })),
}));

vi.mock("picocolors", () => ({
  default: {
    blue: (str: string) => str,
    green: (str: string) => str,
    red: (str: string) => str,
    yellow: (str: string) => str,
    cyan: (str: string) => str,
  },
}));

describe("Migration Utilities", () => {
  describe("isStoryPublishedWithoutChanges", () => {
    it("should return true for published story without changes", () => {
      // Arrange
      const story: IStory = {
        published: true,
        unpublished_changes: false,
      } as IStory;

      // Act
      const result = isStoryPublishedWithoutChanges(story);

      // Assert
      expect(result).toBe(true);
    });

    it("should return false for unpublished story", () => {
      // Arrange
      const story: IStory = {
        published: false,
        unpublished_changes: false,
      } as IStory;

      // Act
      const result = isStoryPublishedWithoutChanges(story);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false for story with unpublished changes", () => {
      // Arrange
      const story: IStory = {
        published: true,
        unpublished_changes: true,
      } as IStory;

      // Act
      const result = isStoryPublishedWithoutChanges(story);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("isStoryWithUnpublishedChanges", () => {
    it("should return true for published story with changes", () => {
      // Arrange
      const story: IStory = {
        published: true,
        unpublished_changes: true,
      } as IStory;

      // Act
      const result = isStoryWithUnpublishedChanges(story);

      // Assert
      expect(result).toBe(true);
    });

    it("should return false for unpublished story", () => {
      // Arrange
      const story: IStory = {
        published: false,
        unpublished_changes: true,
      } as IStory;

      // Act
      const result = isStoryWithUnpublishedChanges(story);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false for story without changes", () => {
      // Arrange
      const story: IStory = {
        published: true,
        unpublished_changes: false,
      } as IStory;

      // Act
      const result = isStoryWithUnpublishedChanges(story);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("runMigration", () => {
    const mockStories = [
      {
        id: 1,
        full_slug: "test-story-1",
        content: { component: "test-component" },
        published: true,
        unpublished_changes: false,
      },
      {
        id: 2,
        full_slug: "test-story-2",
        content: { component: "test-component" },
        published: true,
        unpublished_changes: false,
      },
    ];

    beforeEach(() => {
      vi.clearAllMocks();
      (api.stories.getAll as Mock).mockResolvedValue({
        data: { stories: mockStories },
      });
      (api.stories.get as Mock).mockResolvedValue({
        data: { story: mockStories[0] },
      });
      (api.stories.update as Mock).mockResolvedValue({});
      (processMigration as Mock).mockImplementation((content) => {
        content.component = "updated-component";
      });
    });

    it("should execute migration successfully", async () => {
      // Arrange
      const migrationFn = vi.fn();

      // Act
      const result = await runMigration("test-component", migrationFn);

      // Assert
      expect(result.executed).toBe(true);
      expect(api.stories.getAll).toHaveBeenCalledWith({
        contain_component: "test-component",
      });
      expect(api.stories.get).toHaveBeenCalled();
      expect(api.stories.update).toHaveBeenCalled();
      expect(processMigration).toHaveBeenCalled();
    });

    it("should handle no stories found", async () => {
      // Arrange
      (api.stories.getAll as Mock).mockResolvedValue({
        data: { stories: [] },
      });
      const migrationFn = vi.fn();

      // Act
      const result = await runMigration("test-component", migrationFn);

      // Assert
      expect(result.executed).toBe(false);
      expect(result.motive).toBe("NO_STORIES");
    });

    it("should handle dry run mode", async () => {
      // Arrange
      const migrationFn = vi.fn();

      // Act
      const result = await runMigration("test-component", migrationFn, {
        isDryrun: true,
      });

      // Assert
      expect(result.executed).toBe(true);
      expect(api.stories.update).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      // Arrange
      (api.stories.get as Mock).mockRejectedValue(new Error("API Error"));
      const migrationFn = vi.fn();

      // Act
      const result = await runMigration("test-component", migrationFn);

      // Assert
      expect(result.executed).toBe(true);
    });
  });

  describe("showMigrationChanges", () => {
    const consoleSpy = vi.spyOn(console, "log");

    beforeEach(() => {
      consoleSpy.mockClear();
    });

    it("should show created field", async () => {
      // Arrange
      const field = "newField";
      const value = "value";

      // Act
      await showMigrationChanges(field, value, undefined);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Created field "newField"'),
      );
    });

    it("should show removed field", async () => {
      // Arrange
      const field = "oldField";
      const oldValue = "value";

      // Act
      await showMigrationChanges(field, undefined, oldValue);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Removed the field "oldField"'),
      );
    });

    it("should show updated field", async () => {
      // Arrange
      const field = "field";
      const newValue = "newValue";
      const oldValue = "oldValue";

      // Act
      await showMigrationChanges(field, newValue, oldValue);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Updated field "field"'),
      );
    });
  });

  describe("defineMigration", () => {
    it("should return the same migration object", () => {
      // Arrange
      const migration = {
        type: "create-component" as const,
        schema: {
          name: "Test Component",
          display_name: "Test Component",
          is_root: false,
          is_nestable: true,
          schema: {},
        },
      };

      // Act
      const result = defineMigration(migration);

      // Assert
      expect(result).toBe(migration);
    });

    it("should maintain type safety", () => {
      // Arrange
      const migration = {
        type: "create-component" as const,
        schema: {
          name: "Test Component",
          display_name: "Test Component",
          is_root: false,
          is_nestable: true,
          schema: {},
        },
      };

      // Act
      const result = defineMigration(migration);

      // Assert
      expect(result.type).toBe("create-component");
      expect(result.schema.name).toBe("Test Component");
    });
  });

  describe("Component", () => {
    let component: Component;

    beforeEach(() => {
      component = new Component();
      vi.clearAllMocks();
    });

    it("should create a new component", async () => {
      // Arrange
      const mockComponent: IComponent = {
        name: "test-component",
        schema: {},
        created_at: new Date().toISOString(),
        id: 1,
      };
      (api.components.create as Mock).mockResolvedValue({
        data: { component: mockComponent },
      });

      // Act
      await component.create("test-component");

      // Assert
      expect(component.instance).toBe(mockComponent);
      expect(api.components.create).toHaveBeenCalledWith({
        name: "test-component",
      });
    });

    it("should load an existing component", async () => {
      // Arrange
      const mockComponent: IComponent = {
        name: "test-component",
        schema: {},
        created_at: new Date().toISOString(),
        id: 1,
      };
      (api.components.get as Mock).mockResolvedValue({
        data: { component: mockComponent },
      });

      // Act
      await component.load("test-component");

      // Assert
      expect(component.instance).toBe(mockComponent);
      expect(api.components.get).toHaveBeenCalledWith("test-component");
    });

    it("should add or update fields", () => {
      // Arrange
      const mockComponent: IComponent = {
        name: "test-component",
        schema: {},
        created_at: new Date().toISOString(),
        id: 1,
      };
      component.instance = mockComponent;

      const fields: Record<string, IComponentSchemaItem> = {
        field1: { type: "text", pos: 0 },
        field2: { type: "number", pos: 1 },
      };

      // Act
      component.addOrUpdateFields(fields);

      // Assert
      expect(component.instance.schema).toBeDefined();
    });
  });

  describe("helper", () => {
    it("should update existing component", async () => {
      // Arrange
      const mockComponent: IComponent = {
        name: "test-component",
        schema: {},
        created_at: new Date().toISOString(),
        id: 1,
      };
      (api.components.get as Mock).mockResolvedValue({
        data: { component: mockComponent },
      });

      // Act
      const component = await helper.updateComponent("test-component");

      // Assert
      expect(component).toBeInstanceOf(Component);
      expect(api.components.get).toHaveBeenCalledWith("test-component");
    });

    it("should create new component if not found", async () => {
      // Arrange
      (api.components.get as Mock).mockRejectedValue(new Error("Not found"));
      (api.components.create as Mock).mockResolvedValue({
        data: {
          component: {
            name: "test-component",
            schema: {},
            created_at: new Date().toISOString(),
            id: 1,
          },
        },
      });

      // Act
      const component = await helper.updateComponent("test-component");

      // Assert
      expect(component).toBeInstanceOf(Component);
      expect(api.components.create).toHaveBeenCalledWith({
        name: "test-component",
      });
    });
  });
});
