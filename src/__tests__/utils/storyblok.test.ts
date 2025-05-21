import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTranslatableComponentFields,
  addOrUpdateDatasource,
  resetTab,
  moveToTab,
  getDeprecatedTab,
  moveToDeprecated,
  moveToSettings,
  addOrUpdateFields,
  createRollbackFile,
  processMigration,
} from "../../utils/storyblok";
import { components, datasources, datasourceEntries } from "../../utils/api";
import fs from "fs";
import { IComponent, IComponentSchemaTab } from "../../types/IComponent";
import { IStoryContent } from "../../types/stories/IStoryContent";
import { IDataSource, IDataSourceEntry } from "../../types/IDataSource";

// Mock the API modules
vi.mock("../../utils/api", () => ({
  components: {
    getAll: vi.fn(),
  },
  datasources: {
    has: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
  },
  datasourceEntries: {
    getAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock fs module
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    unlinkSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  unlinkSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

describe("Storyblok Utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTranslatableComponentFields", () => {
    it("should return translatable fields for a specific component", async () => {
      // Arrange
      const mockComponents = {
        data: {
          components: [
            {
              name: "component1",
              schema: {
                field1: { type: "text", translatable: true },
                field2: { type: "text", translatable: false },
              },
            },
          ],
        },
      };
      (components.getAll as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockComponents,
      );

      // Act
      const result = await getTranslatableComponentFields("component1");

      // Assert
      expect(result).toEqual(["field1"]);
    });

    it("should return empty array for non-existent component", async () => {
      // Arrange
      const mockComponents = {
        data: {
          components: [
            {
              name: "component1",
              schema: {
                field1: { type: "text", translatable: true },
              },
            },
          ],
        },
      };
      (components.getAll as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockComponents,
      );

      // Act
      const result = await getTranslatableComponentFields("nonExistent");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("addOrUpdateDatasource", () => {
    it("should create new datasource if it doesn't exist", async () => {
      // Arrange
      const mockDatasource: IDataSource = {
        id: 123,
        name: "test",
        slug: "test",
        dimensions: [],
        created_at: "2024-03-20T00:00:00.000Z",
        updated_at: "2024-03-20T00:00:00.000Z",
      };
      (datasources.has as ReturnType<typeof vi.fn>).mockResolvedValue(false);
      (datasources.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { datasource: mockDatasource },
      });
      (datasourceEntries.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { datasource_entries: [] },
      });
      (datasourceEntries.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { datasource: { id: 456 } },
      });

      // Act
      const [datasource, entries] = await addOrUpdateDatasource("test", [
        { name: "entry1", value: "value1" },
      ]);

      // Assert
      expect(datasource).toEqual(mockDatasource);
      expect(entries).toHaveLength(1);
      expect(datasources.create).toHaveBeenCalledWith({
        slug: "test",
        name: "test",
      });
    });

    it("should update existing datasource", async () => {
      // Arrange
      const mockDatasource: IDataSource = {
        id: 123,
        name: "test",
        slug: "test",
        dimensions: [],
        created_at: "2024-03-20T00:00:00.000Z",
        updated_at: "2024-03-20T00:00:00.000Z",
      };
      const mockEntry: IDataSourceEntry = {
        id: 456,
        name: "entry1",
        value: "value1",
      };
      (datasources.has as ReturnType<typeof vi.fn>).mockResolvedValue(true);
      (datasources.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { datasource: mockDatasource },
      });
      (datasourceEntries.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { datasource_entries: [mockEntry] },
      });

      // Act
      const [datasource, entries] = await addOrUpdateDatasource("test", [
        { name: "entry1", value: "value1" },
      ]);

      // Assert
      expect(datasource).toEqual(mockDatasource);
      expect(entries).toHaveLength(1);
      expect(datasources.get).toHaveBeenCalledWith("test");
    });
  });

  describe("Tab Management Functions", () => {
    const mockComponent: IComponent = {
      name: "test",
      id: 123,
      created_at: "2024-03-20T00:00:00.000Z",
      schema: {
        "tab-content": {
          type: "tab" as const,
          display_name: "Content",
          keys: ["field1", "field2"],
        } as IComponentSchemaTab,
        "tab-settings": {
          type: "tab" as const,
          display_name: "Settings",
          keys: ["field3"],
        } as IComponentSchemaTab,
      },
    };

    describe("resetTab", () => {
      it("should reset keys in an existing tab", () => {
        // Act
        const result = resetTab(mockComponent, "Content");

        // Assert
        const tab = result?.schema?.["tab-content"] as IComponentSchemaTab;
        expect(tab.keys).toEqual([]);
      });

      it("should create new tab if it doesn't exist", () => {
        // Act
        const result = resetTab(mockComponent, "New Tab");

        // Assert
        const tab = result?.schema?.["tab-New Tab"] as IComponentSchemaTab;
        expect(tab).toBeDefined();
        expect(tab.keys).toEqual([]);
      });
    });

    describe("moveToTab", () => {
      it("should move fields to an existing tab", () => {
        // Act
        const result = moveToTab(mockComponent, "Content", [
          "field4",
          "field5",
        ]);

        // Assert
        const tab = result?.schema?.["tab-content"] as IComponentSchemaTab;
        expect(tab.keys).toEqual(["field4", "field5"]);
      });

      it("should create new tab if it doesn't exist", () => {
        // Act
        const result = moveToTab(mockComponent, "New Tab", [
          "field4",
          "field5",
        ]);

        // Assert
        const tab = result?.schema?.["tab-New Tab"] as IComponentSchemaTab;
        expect(tab).toBeDefined();
        expect(tab.keys).toEqual(["field4", "field5"]);
      });
    });

    describe("getDeprecatedTab", () => {
      it("should return existing deprecated tab", () => {
        const componentWithDeprecated = {
          ...mockComponent,
          schema: {
            ...mockComponent.schema,
            "tab-deprecated": {
              type: "tab" as const,
              display_name: "Deprecated",
              keys: ["oldField"],
            } as IComponentSchemaTab,
          },
        };

        // Act
        const [key, tab] = getDeprecatedTab(componentWithDeprecated);

        // Assert
        expect(key).toBe("tab-deprecated");
        expect(tab.display_name).toBe("Deprecated");
      });

      it("should create new deprecated tab if it doesn't exist", () => {
        // Act
        const [key, tab] = getDeprecatedTab(mockComponent);

        // Assert
        expect(key).toBe("tab-deprecated");
        expect(tab.display_name).toBe("deprecated");
      });
    });

    describe("moveToDeprecated", () => {
      it("should move fields to deprecated tab", () => {
        // Act
        const result = moveToDeprecated(mockComponent, [
          "oldField1",
          "oldField2",
        ]);

        // Assert
        const tab = result?.schema?.["tab-deprecated"] as IComponentSchemaTab;
        expect(tab.keys).toEqual(["oldField1", "oldField2"]);
      });
    });

    describe("moveToSettings", () => {
      it("should move fields to settings tab", () => {
        // Act
        const result = moveToSettings(mockComponent, ["setting1", "setting2"]);

        // Assert
        const tab = result?.schema?.["tab-settings"] as IComponentSchemaTab;
        expect(tab.keys).toEqual(["setting1", "setting2"]);
      });
    });
  });

  describe("addOrUpdateFields", () => {
    it("should add new fields to component schema", () => {
      // Arrange
      const component: IComponent = {
        name: "test",
        id: 123,
        created_at: "2024-03-20T00:00:00.000Z",
        schema: {
          field1: { type: "text" as const, display_name: "Field 1" },
        },
      };
      const newFields = {
        field2: { type: "text" as const, display_name: "Field 2" },
        field3: { type: "text" as const, display_name: "Field 3" },
      };

      // Act
      const result = addOrUpdateFields(component, newFields);

      // Assert
      expect(result.schema).toEqual({
        ...newFields,
        ...component.schema,
        ...newFields,
      });
    });
  });

  describe("createRollbackFile", () => {
    it("should create rollback file with correct data", async () => {
      // Arrange
      const rollbackData = [{ id: 1, name: "test" }];
      const mockDate = "2024-03-20";
      vi.spyOn(Date.prototype, "toISOString").mockReturnValue(
        `${mockDate}T00:00:00.000Z`,
      );
      (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);

      // Act
      const result = await createRollbackFile(rollbackData, "test", "field");

      // Assert
      expect(result).toEqual({ component: "test", created: true });
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining("migrations/rollback"),
        { recursive: true },
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`${mockDate}_rollback_test_field.json`),
        JSON.stringify(rollbackData, null, 2),
      );
    });

    it("should handle existing rollback file", async () => {
      // Arrange
      const rollbackData = [{ id: 1, name: "test" }];
      (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);

      // Act
      const result = await createRollbackFile(rollbackData, "test", "field");

      // Assert
      expect(result).toEqual({ component: "test", created: true });
      expect(fs.unlinkSync).toHaveBeenCalled();
    });
  });

  describe("processMigration", () => {
    it("should process matching component", async () => {
      // Arrange
      const content: IStoryContent = {
        component: "test",
        field1: "value1",
      };
      const migrationFn = vi.fn();

      // Act
      await processMigration(content, "test", migrationFn, "test-story");

      // Assert
      expect(migrationFn).toHaveBeenCalledWith(content);
    });

    it("should process nested components", async () => {
      // Arrange
      const content: IStoryContent = {
        component: "parent",
        blocks: [
          {
            component: "test",
            field1: "value1",
          },
        ],
      };
      const migrationFn = vi.fn();

      // Act
      await processMigration(content, "test", migrationFn, "test-story");

      // Assert
      expect(migrationFn).toHaveBeenCalledWith(content.blocks[0]);
    });

    it("should process rich text bloks", async () => {
      // Arrange
      const content: IStoryContent = {
        component: "parent",
        content: {
          type: "doc",
          content: [
            {
              type: "blok",
              attrs: {
                body: {
                  component: "test",
                  field1: "value1",
                },
              },
            },
          ],
        },
      };
      const migrationFn = vi.fn();

      // Act
      await processMigration(content, "test", migrationFn, "test-story");

      // Assert
      expect(migrationFn).toHaveBeenCalledWith(
        content.content.content[0].attrs.body,
      );
    });
  });
});
