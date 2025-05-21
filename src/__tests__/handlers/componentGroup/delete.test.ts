import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { handleDeleteComponentGroup } from "../../../handlers/componentGroup/delete";
import { api } from "../../../utils/api";

// Mock the API
vi.mock("../../../utils/api", () => ({
  api: {
    componentGroups: {
      getAll: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("handleDeleteComponentGroup", () => {
  const mockMigration = {
    id: 123,
  };

  const mockOptions = {
    isDryrun: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete a component group successfully by ID", async () => {
    // Arrange
    const mockExistingGroups = {
      data: {
        component_groups: [
          {
            id: 123,
            name: "test-group",
          },
        ],
      },
    };

    (api.componentGroups.getAll as Mock).mockResolvedValue(mockExistingGroups);
    (api.componentGroups.delete as Mock).mockResolvedValue({});

    // Act
    await handleDeleteComponentGroup(mockMigration, mockOptions);

    // Assert
    expect(api.componentGroups.getAll).toHaveBeenCalled();
    expect(api.componentGroups.delete).toHaveBeenCalledWith(123);
  });

  it("should delete a component group successfully by name", async () => {
    // Arrange
    const mockMigrationByName = {
      id: "test-group",
    };

    const mockExistingGroups = {
      data: {
        component_groups: [
          {
            id: 123,
            name: "test-group",
          },
        ],
      },
    };

    (api.componentGroups.getAll as Mock).mockResolvedValue(mockExistingGroups);
    (api.componentGroups.delete as Mock).mockResolvedValue({});

    // Act
    await handleDeleteComponentGroup(mockMigrationByName, mockOptions);

    // Assert
    expect(api.componentGroups.getAll).toHaveBeenCalled();
    expect(api.componentGroups.delete).toHaveBeenCalledWith(123);
  });

  it("should handle dry run correctly", async () => {
    // Arrange
    const dryRunOptions = { isDryrun: true };

    // Act
    await handleDeleteComponentGroup(mockMigration, dryRunOptions);

    // Assert
    expect(api.componentGroups.getAll).not.toHaveBeenCalled();
    expect(api.componentGroups.delete).not.toHaveBeenCalled();
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
      handleDeleteComponentGroup(mockMigration, mockOptions),
    ).rejects.toThrow('Component group "123" not found');
    expect(api.componentGroups.delete).not.toHaveBeenCalled();
  });

  it("should throw error if component group has no ID", async () => {
    // Arrange
    const mockExistingGroups = {
      data: {
        component_groups: [
          {
            name: "test-group",
            // Missing id
          },
        ],
      },
    };

    (api.componentGroups.getAll as Mock).mockResolvedValue(mockExistingGroups);

    // Act & Assert
    await expect(
      handleDeleteComponentGroup({ id: "test-group" }, mockOptions),
    ).rejects.toThrow('Component group "test-group" has no ID');
    expect(api.componentGroups.delete).not.toHaveBeenCalled();
  });

  it("should handle API errors gracefully", async () => {
    // Arrange
    const error = new Error("API Error");
    (api.componentGroups.getAll as Mock).mockRejectedValue(error);

    // Act & Assert
    await expect(
      handleDeleteComponentGroup(mockMigration, mockOptions),
    ).rejects.toThrow("API Error");
  });

  it("should handle delete errors gracefully", async () => {
    // Arrange
    const mockExistingGroups = {
      data: {
        component_groups: [
          {
            id: 123,
            name: "test-group",
          },
        ],
      },
    };

    const error = new Error("Delete Error");
    (api.componentGroups.getAll as Mock).mockResolvedValue(mockExistingGroups);
    (api.componentGroups.delete as Mock).mockRejectedValue(error);

    // Act & Assert
    await expect(
      handleDeleteComponentGroup(mockMigration, mockOptions),
    ).rejects.toThrow("Delete Error");
  });
});
