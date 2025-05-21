import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { handleUpdateComponentGroup } from "../../../handlers/componentGroup/update";
import { api } from "../../../utils/api";
import { ComponentGroupMigration } from "../../../types/migration";

// Mock the API
vi.mock("../../../utils/api", () => ({
  api: {
    componentGroups: {
      getAll: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("handleUpdateComponentGroup", () => {
  const mockMigration = {
    id: 123,
    group: {
      name: "updated-group-name",
    } as ComponentGroupMigration,
  };

  const mockOptions = {
    isDryrun: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update a component group successfully by ID", async () => {
    // Arrange
    const mockExistingGroups = {
      data: {
        component_groups: [
          {
            id: 123,
            name: "old-group-name",
            uuid: "group-uuid-123",
          },
        ],
      },
    };

    (api.componentGroups.getAll as Mock).mockResolvedValue(mockExistingGroups);
    (api.componentGroups.update as Mock).mockResolvedValue({});

    // Act
    await handleUpdateComponentGroup(mockMigration, mockOptions);

    // Assert
    expect(api.componentGroups.getAll).toHaveBeenCalled();
    expect(api.componentGroups.update).toHaveBeenCalledWith({
      id: 123,
      name: "updated-group-name",
      uuid: "group-uuid-123",
    });
  });

  it("should update a component group successfully by name", async () => {
    // Arrange
    const mockMigrationByName = {
      id: "old-group-name",
      group: {
        name: "updated-group-name",
      } as ComponentGroupMigration,
    };

    const mockExistingGroups = {
      data: {
        component_groups: [
          {
            id: 123,
            name: "old-group-name",
            uuid: "group-uuid-123",
          },
        ],
      },
    };

    (api.componentGroups.getAll as Mock).mockResolvedValue(mockExistingGroups);
    (api.componentGroups.update as Mock).mockResolvedValue({});

    // Act
    await handleUpdateComponentGroup(mockMigrationByName, mockOptions);

    // Assert
    expect(api.componentGroups.getAll).toHaveBeenCalled();
    expect(api.componentGroups.update).toHaveBeenCalledWith({
      id: 123,
      name: "updated-group-name",
      uuid: "group-uuid-123",
    });
  });

  it("should handle dry run correctly", async () => {
    // Arrange
    const dryRunOptions = { isDryrun: true };

    // Act
    await handleUpdateComponentGroup(mockMigration, dryRunOptions);

    // Assert
    expect(api.componentGroups.getAll).not.toHaveBeenCalled();
    expect(api.componentGroups.update).not.toHaveBeenCalled();
  });

  it("should throw error if component group does not exist", async () => {
    // Arrange
    const mockExistingGroups = {
      data: {
        component_groups: [],
      },
    };

    (api.componentGroups.getAll as Mock).mockResolvedValue(mockExistingGroups);

    // Act & Assert
    await expect(
      handleUpdateComponentGroup(mockMigration, mockOptions),
    ).rejects.toThrow('Component group "123" not found');
    expect(api.componentGroups.update).not.toHaveBeenCalled();
  });

  it("should throw error if component group has missing properties", async () => {
    // Arrange
    const mockExistingGroups = {
      data: {
        component_groups: [
          {
            id: 123,
            name: "old-group-name",
            // Missing uuid
          },
        ],
      },
    };

    (api.componentGroups.getAll as Mock).mockResolvedValue(mockExistingGroups);

    // Act & Assert
    await expect(
      handleUpdateComponentGroup(mockMigration, mockOptions),
    ).rejects.toThrow('Component group "123" has missing required properties');
    expect(api.componentGroups.update).not.toHaveBeenCalled();
  });

  it("should handle API errors gracefully", async () => {
    // Arrange
    const error = new Error("API Error");
    (api.componentGroups.getAll as Mock).mockRejectedValue(error);

    // Act & Assert
    await expect(
      handleUpdateComponentGroup(mockMigration, mockOptions),
    ).rejects.toThrow("API Error");
  });

  it("should handle update errors gracefully", async () => {
    // Arrange
    const mockExistingGroups = {
      data: {
        component_groups: [
          {
            id: 123,
            name: "old-group-name",
            uuid: "group-uuid-123",
          },
        ],
      },
    };

    const error = new Error("Update Error");
    (api.componentGroups.getAll as Mock).mockResolvedValue(mockExistingGroups);
    (api.componentGroups.update as Mock).mockRejectedValue(error);

    // Act & Assert
    await expect(
      handleUpdateComponentGroup(mockMigration, mockOptions),
    ).rejects.toThrow("Update Error");
  });
});
