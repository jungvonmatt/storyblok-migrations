import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { handleDeleteDatasource } from "../../../handlers/datasource/delete";
import { api } from "../../../utils/api";

// Mock the API
vi.mock("../../../utils/api", () => ({
  api: {
    datasources: {
      get: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("handleDeleteDatasource", () => {
  const mockDatasource = {
    id: 123,
    name: "test-datasource",
    slug: "test-datasource",
  };

  const mockMigration = {
    id: 123,
  };

  const mockOptions = {
    isDryrun: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete a datasource successfully", async () => {
    // Arrange
    (api.datasources.get as Mock).mockResolvedValue({
      data: { datasource: mockDatasource },
    });
    (api.datasources.delete as Mock).mockResolvedValue({});

    // Act
    await handleDeleteDatasource(mockMigration, mockOptions);

    // Assert
    expect(api.datasources.get).toHaveBeenCalledWith(123);
    expect(api.datasources.delete).toHaveBeenCalledWith(123);
  });

  it("should handle dry run correctly", async () => {
    // Arrange
    const dryRunOptions = { isDryrun: true };

    // Act
    await handleDeleteDatasource(mockMigration, dryRunOptions);

    // Assert
    expect(api.datasources.get).not.toHaveBeenCalled();
    expect(api.datasources.delete).not.toHaveBeenCalled();
  });

  it("should handle non-existent datasource gracefully", async () => {
    // Arrange
    (api.datasources.get as Mock).mockResolvedValue({
      data: { datasource: null },
    });

    // Act
    await handleDeleteDatasource(mockMigration, mockOptions);

    // Assert
    expect(api.datasources.get).toHaveBeenCalledWith(123);
    expect(api.datasources.delete).not.toHaveBeenCalled();
  });

  it("should handle API errors gracefully", async () => {
    // Arrange
    const error = new Error("API Error");
    (api.datasources.get as Mock).mockRejectedValue(error);

    // Act
    await handleDeleteDatasource(mockMigration, mockOptions);

    // Assert
    expect(api.datasources.get).toHaveBeenCalledWith(123);
    expect(api.datasources.delete).not.toHaveBeenCalled();
  });

  it("should handle delete errors gracefully", async () => {
    // Arrange
    (api.datasources.get as Mock).mockResolvedValue({
      data: { datasource: mockDatasource },
    });
    const error = new Error("Delete Error");
    (api.datasources.delete as Mock).mockRejectedValue(error);

    // Act
    await handleDeleteDatasource(mockMigration, mockOptions);

    // Assert
    expect(api.datasources.get).toHaveBeenCalledWith(123);
    expect(api.datasources.delete).toHaveBeenCalledWith(123);
  });
});
