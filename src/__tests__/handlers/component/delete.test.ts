import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { handleDeleteComponent } from "../../../handlers/component/delete";
import { api } from "../../../utils/api";

// Mock the API
vi.mock("../../../utils/api", () => ({
  api: {
    components: {
      getAll: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("handleDeleteComponent", () => {
  const mockMigration = {
    name: "test-component",
  };

  const mockOptions = {
    isDryrun: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete a component successfully", async () => {
    // Arrange
    const mockComponents = {
      data: {
        components: [
          { id: 123, name: "test-component" },
          { id: 456, name: "other-component" },
        ],
      },
    };
    (api.components.getAll as Mock).mockResolvedValue(mockComponents);
    (api.components.delete as Mock).mockResolvedValue({});

    // Act
    await handleDeleteComponent(mockMigration, mockOptions);

    // Assert
    expect(api.components.getAll).toHaveBeenCalled();
    expect(api.components.delete).toHaveBeenCalledWith(123);
  });

  it("should handle dry run correctly", async () => {
    // Arrange
    const dryRunOptions = { isDryrun: true };

    // Act
    await handleDeleteComponent(mockMigration, dryRunOptions);

    // Assert
    expect(api.components.getAll).not.toHaveBeenCalled();
    expect(api.components.delete).not.toHaveBeenCalled();
  });

  it("should throw error if component does not exist", async () => {
    // Arrange
    const mockComponents = {
      data: {
        components: [{ id: 456, name: "other-component" }],
      },
    };
    (api.components.getAll as Mock).mockResolvedValue(mockComponents);

    // Act & Assert
    await expect(
      handleDeleteComponent(mockMigration, mockOptions),
    ).rejects.toThrow('Component "test-component" not found');
    expect(api.components.delete).not.toHaveBeenCalled();
  });

  it("should handle API errors gracefully", async () => {
    // Arrange
    const error = new Error("API Error");
    (api.components.getAll as Mock).mockRejectedValue(error);

    // Act & Assert
    await expect(
      handleDeleteComponent(mockMigration, mockOptions),
    ).rejects.toThrow("API Error");
  });

  it("should find component by ID if name is a number", async () => {
    // Arrange
    const mockMigrationWithId = {
      name: 123,
    };
    const mockComponents = {
      data: {
        components: [
          { id: 123, name: "test-component" },
          { id: 456, name: "other-component" },
        ],
      },
    };
    (api.components.getAll as Mock).mockResolvedValue(mockComponents);
    (api.components.delete as Mock).mockResolvedValue({});

    // Act
    await handleDeleteComponent(mockMigrationWithId, mockOptions);

    // Assert
    expect(api.components.getAll).toHaveBeenCalled();
    expect(api.components.delete).toHaveBeenCalledWith(123);
  });
});
