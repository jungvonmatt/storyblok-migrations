import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { handleCreateComponentGroup } from "../../../handlers/componentGroup/create";
import { api } from "../../../utils/api";
import { ComponentGroupMigration } from "../../../types/migration";

// Mock the API
vi.mock("../../../utils/api", () => ({
  api: {
    componentGroups: {
      getAll: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("handleCreateComponentGroup", () => {
  const mockMigration = {
    groups: [
      { name: "test-group-1" },
      { name: "test-group-2" },
    ] as ComponentGroupMigration[],
  };

  const mockOptions = {
    isDryrun: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create new component groups successfully", async () => {
    // Arrange
    const mockExistingGroups = {
      data: {
        component_groups: [],
      },
    };
    const mockCreateResponse = {
      data: {
        component_group: {
          id: 123,
        },
      },
    };

    (api.componentGroups.getAll as Mock).mockResolvedValue(mockExistingGroups);
    (api.componentGroups.create as Mock).mockResolvedValue(mockCreateResponse);

    // Act
    await handleCreateComponentGroup(mockMigration, mockOptions);

    // Assert
    expect(api.componentGroups.getAll).toHaveBeenCalled();
    expect(api.componentGroups.create).toHaveBeenCalledTimes(2);
    expect(api.componentGroups.create).toHaveBeenCalledWith({
      name: "test-group-1",
    });
    expect(api.componentGroups.create).toHaveBeenCalledWith({
      name: "test-group-2",
    });
  });

  it("should handle dry run correctly", async () => {
    // Arrange
    const dryRunOptions = { isDryrun: true };

    // Act
    await handleCreateComponentGroup(mockMigration, dryRunOptions);

    // Assert
    expect(api.componentGroups.getAll).not.toHaveBeenCalled();
    expect(api.componentGroups.create).not.toHaveBeenCalled();
  });

  it("should skip existing component groups", async () => {
    // Arrange
    const mockExistingGroups = {
      data: {
        component_groups: [{ name: "test-group-1" }],
      },
    };
    const mockCreateResponse = {
      data: {
        component_group: {
          id: 123,
        },
      },
    };

    (api.componentGroups.getAll as Mock).mockResolvedValue(mockExistingGroups);
    (api.componentGroups.create as Mock).mockResolvedValue(mockCreateResponse);

    // Act
    await handleCreateComponentGroup(mockMigration, mockOptions);

    // Assert
    expect(api.componentGroups.getAll).toHaveBeenCalled();
    expect(api.componentGroups.create).toHaveBeenCalledTimes(1);
    expect(api.componentGroups.create).toHaveBeenCalledWith({
      name: "test-group-2",
    });
  });

  it("should handle API errors gracefully", async () => {
    // Arrange
    const error = new Error("API Error");
    (api.componentGroups.getAll as Mock).mockRejectedValue(error);

    // Act & Assert
    await expect(
      handleCreateComponentGroup(mockMigration, mockOptions),
    ).rejects.toThrow("API Error");
  });

  it("should handle creation errors gracefully", async () => {
    // Arrange
    const mockExistingGroups = {
      data: {
        component_groups: [],
      },
    };
    const error = new Error("Creation Error");
    (api.componentGroups.getAll as Mock).mockResolvedValue(mockExistingGroups);
    (api.componentGroups.create as Mock).mockRejectedValue(error);

    // Act & Assert
    await expect(
      handleCreateComponentGroup(mockMigration, mockOptions),
    ).rejects.toThrow("Creation Error");
  });
});
