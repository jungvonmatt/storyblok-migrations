import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { handleUpdateComponent } from "../../../handlers/component/update";
import { api } from "../../../utils/api";
import { helper } from "../../../utils/migration";
import { createRollbackFile } from "../../../utils/storyblok";
import { ComponentMigration } from "../../../types/migration";
import { IComponentSchemaItemText } from "../../../types/IComponent";

// Mock the API and helper functions
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

vi.mock("../../../utils/migration", () => ({
  helper: {
    updateComponent: vi.fn(),
  },
}));

vi.mock("../../../utils/storyblok", () => ({
  createRollbackFile: vi.fn(),
}));

// Create spy functions for Component methods
const addOrUpdateFieldsSpy = vi.fn();
const saveSpy = vi.fn();

// Mock the Component instance
const mockComponent = {
  addOrUpdateFields: addOrUpdateFieldsSpy,
  save: saveSpy,
  instance: {
    id: 123,
    name: "test-component",
    schema: {},
    display_name: "Old Display Name",
    is_root: false,
    is_nestable: true,
    component_group_uuid: "old-group-uuid",
  },
};

describe("handleUpdateComponent", () => {
  const mockMigration = {
    schema: {
      name: "test-component",
      display_name: "New Display Name",
      is_root: true,
      is_nestable: false,
      component_group_name: "new-group",
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
    } as Partial<ComponentMigration>,
  };

  const mockOptions = {
    isDryrun: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock component instance before each test
    mockComponent.instance = {
      id: 123,
      name: "test-component",
      schema: {},
      display_name: "Old Display Name",
      is_root: false,
      is_nestable: true,
      component_group_uuid: "old-group-uuid",
    };
    (helper.updateComponent as Mock).mockResolvedValue(mockComponent);
  });

  it("should update a component successfully", async () => {
    // Arrange
    const mockComponents = {
      data: {
        components: [{ name: "test-component" }],
      },
    };
    const mockComponentGroups = {
      data: {
        component_groups: [{ name: "new-group", uuid: "new-group-uuid" }],
      },
    };

    (api.components.getAll as Mock).mockResolvedValue(mockComponents);
    (api.componentGroups.getAll as Mock).mockResolvedValue(mockComponentGroups);

    // Act
    await handleUpdateComponent(mockMigration, mockOptions);

    // Assert
    expect(api.components.getAll).toHaveBeenCalled();
    expect(helper.updateComponent).toHaveBeenCalledWith("test-component");
    expect(addOrUpdateFieldsSpy).toHaveBeenCalledWith(
      mockMigration.schema.schema,
      {
        general: ["field1"],
        advanced: ["field2"],
      },
    );
    expect(saveSpy).toHaveBeenCalled();
    expect(createRollbackFile).toHaveBeenCalled();
  });

  it("should handle dry run correctly", async () => {
    // Arrange
    const dryRunOptions = { isDryrun: true };

    // Act
    await handleUpdateComponent(mockMigration, dryRunOptions);

    // Assert
    expect(api.components.getAll).not.toHaveBeenCalled();
    expect(helper.updateComponent).not.toHaveBeenCalled();
    expect(addOrUpdateFieldsSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
    expect(createRollbackFile).not.toHaveBeenCalled();
  });

  it("should throw error if component does not exist", async () => {
    // Arrange
    const mockComponents = {
      data: {
        components: [],
      },
    };
    (api.components.getAll as Mock).mockResolvedValue(mockComponents);

    // Act & Assert
    await expect(
      handleUpdateComponent(mockMigration, mockOptions),
    ).rejects.toThrow('Component "test-component" not found');
    expect(helper.updateComponent).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("should handle component group updates correctly", async () => {
    // Arrange
    const mockComponents = {
      data: {
        components: [{ name: "test-component" }],
      },
    };
    const mockComponentGroups = {
      data: {
        component_groups: [{ name: "new-group", uuid: "new-group-uuid" }],
      },
    };

    (api.components.getAll as Mock).mockResolvedValue(mockComponents);
    (api.componentGroups.getAll as Mock).mockResolvedValue(mockComponentGroups);

    // Act
    await handleUpdateComponent(mockMigration, mockOptions);

    // Assert
    expect(mockComponent.instance.component_group_uuid).toBe("new-group-uuid");
  });

  it("should handle non-existent component group gracefully", async () => {
    // Arrange
    const mockComponents = {
      data: {
        components: [{ name: "test-component" }],
      },
    };
    const mockComponentGroups = {
      data: {
        component_groups: [], // Empty array to simulate no matching group
      },
    };

    (api.components.getAll as Mock).mockResolvedValue(mockComponents);
    (api.componentGroups.getAll as Mock).mockResolvedValue(mockComponentGroups);

    // Act
    await handleUpdateComponent(mockMigration, mockOptions);

    // Assert
    expect(mockComponent.instance.component_group_uuid).toBe("old-group-uuid");
  });

  it("should create rollback file with correct data", async () => {
    // Arrange
    const mockComponents = {
      data: {
        components: [{ name: "test-component" }],
      },
    };
    const mockComponentGroups = {
      data: {
        component_groups: [{ name: "new-group", uuid: "new-group-uuid" }],
      },
    };

    // Create a copy of the original state for rollback
    const originalState = {
      id: mockComponent.instance.id,
      name: mockComponent.instance.name,
      schema: { ...mockComponent.instance.schema },
      display_name: mockComponent.instance.display_name,
      is_root: mockComponent.instance.is_root,
      is_nestable: mockComponent.instance.is_nestable,
      component_group_uuid: mockComponent.instance.component_group_uuid,
    };

    (api.components.getAll as Mock).mockResolvedValue(mockComponents);
    (api.componentGroups.getAll as Mock).mockResolvedValue(mockComponentGroups);

    // Act
    await handleUpdateComponent(mockMigration, mockOptions);

    // Assert
    expect(createRollbackFile).toHaveBeenCalledWith(
      [originalState],
      "component_test_component",
      "update",
    );
  });

  it("should handle API errors gracefully", async () => {
    // Arrange
    const error = new Error("API Error");
    (api.components.getAll as Mock).mockRejectedValue(error);

    // Act & Assert
    await expect(
      handleUpdateComponent(mockMigration, mockOptions),
    ).rejects.toThrow("API Error");
  });
});
