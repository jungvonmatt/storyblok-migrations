import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { handleCreateComponent } from "../../../handlers/component/create";
import { api } from "../../../utils/api";
import { Component } from "../../../utils/migration";
import { ComponentMigration } from "../../../types/migration";
import { IComponentSchemaItemText } from "../../../types/IComponent";

// Mock the API and Component class
vi.mock("../../../utils/api", () => ({
  api: {
    components: {
      getAll: vi.fn(),
    },
    componentGroups: {
      getAll: vi.fn(),
    },
  },
}));

// Create spy functions for Component methods
const createSpy = vi.fn();
const saveSpy = vi.fn();
const addOrUpdateFieldsSpy = vi.fn();

// Mock the Component class with proper prototype methods
vi.mock("../../../utils/migration", () => ({
  Component: vi.fn().mockImplementation(() => ({
    create: createSpy,
    save: saveSpy,
    addOrUpdateFields: addOrUpdateFieldsSpy,
    instance: {
      display_name: "",
      is_root: false,
      is_nestable: false,
      component_group_uuid: "",
    },
  })),
}));

describe("handleCreateComponent", () => {
  const mockMigration = {
    schema: {
      name: "test-component",
      display_name: "Test Component",
      is_root: true,
      is_nestable: false,
      component_group_name: "test-group",
      schema: {
        field1: {
          type: "text",
          display_name: "Field 1",
        } as IComponentSchemaItemText,
        field2: {
          type: "text",
          display_name: "Field 2",
        } as IComponentSchemaItemText,
      },
      tabs: {
        general: ["field1"],
        advanced: ["field2"],
      },
    } as ComponentMigration,
  };

  const mockOptions = {
    isDryrun: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new component successfully", async () => {
    // Arrange
    const mockComponents = { data: { components: [] } };
    const mockComponentGroups = {
      data: {
        component_groups: [{ name: "test-group", uuid: "group-123" }],
      },
    };

    (api.components.getAll as Mock).mockResolvedValue(mockComponents);
    (api.componentGroups.getAll as Mock).mockResolvedValue(mockComponentGroups);

    // Act
    await handleCreateComponent(mockMigration, mockOptions);

    // Assert
    expect(api.components.getAll).toHaveBeenCalled();
    expect(api.componentGroups.getAll).toHaveBeenCalled();
    expect(Component).toHaveBeenCalled();
    expect(createSpy).toHaveBeenCalledWith("test-component");
    expect(saveSpy).toHaveBeenCalled();
  });

  it("should not create component if it already exists", async () => {
    // Arrange
    const mockComponents = {
      data: {
        components: [{ name: "test-component" }],
      },
    };
    (api.components.getAll as Mock).mockResolvedValue(mockComponents);

    // Act
    await handleCreateComponent(mockMigration, mockOptions);

    // Assert
    expect(api.components.getAll).toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("should handle dry run correctly", async () => {
    // Arrange
    const dryRunOptions = { isDryrun: true };

    // Act
    await handleCreateComponent(mockMigration, dryRunOptions);

    // Assert
    expect(api.components.getAll).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("should handle component group assignment correctly", async () => {
    // Arrange
    const mockComponents = { data: { components: [] } };
    const mockComponentGroups = {
      data: {
        component_groups: [{ name: "test-group", uuid: "group-123" }],
      },
    };

    (api.components.getAll as Mock).mockResolvedValue(mockComponents);
    (api.componentGroups.getAll as Mock).mockResolvedValue(mockComponentGroups);

    // Act
    await handleCreateComponent(mockMigration, mockOptions);

    // Assert
    const componentInstance = (Component as Mock).mock.results[0]?.value;
    expect(componentInstance?.instance.component_group_uuid).toBe("group-123");
  });

  it("should handle schema fields and tabs correctly", async () => {
    // Arrange
    const mockComponents = { data: { components: [] } };
    const mockComponentGroups = {
      data: {
        component_groups: [{ name: "test-group", uuid: "group-123" }],
      },
    };

    (api.components.getAll as Mock).mockResolvedValue(mockComponents);
    (api.componentGroups.getAll as Mock).mockResolvedValue(mockComponentGroups);

    // Act
    await handleCreateComponent(mockMigration, mockOptions);

    // Assert
    expect(addOrUpdateFieldsSpy).toHaveBeenCalledWith(
      mockMigration.schema.schema,
      {
        general: ["field1"],
        advanced: ["field2"],
      },
    );
  });

  it("should handle API errors gracefully", async () => {
    // Arrange
    const error = new Error("API Error");
    (api.components.getAll as Mock).mockRejectedValue(error);

    // Act & Assert
    await expect(
      handleCreateComponent(mockMigration, mockOptions),
    ).rejects.toThrow("API Error");
  });
});
