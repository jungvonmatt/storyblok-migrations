import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { handleUpdateDatasource } from "../../../handlers/datasource/update";
import { api } from "../../../utils/api";
import {
  addOrUpdateDatasource,
  createRollbackFile,
} from "../../../utils/storyblok";
import { DatasourceMigration } from "../../../types/migration";
import { IPendingDataSourceEntry } from "../../../types/IDataSource";

// Mock the API and utility functions
vi.mock("../../../utils/api", () => ({
  api: {
    datasources: {
      get: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("../../../utils/storyblok", () => ({
  addOrUpdateDatasource: vi.fn(),
  createRollbackFile: vi.fn(),
}));

describe("handleUpdateDatasource", () => {
  const mockDatasource: DatasourceMigration = {
    name: "updated-datasource",
    slug: "updated-datasource",
  };

  const mockEntries: Omit<IPendingDataSourceEntry, "datasource_id">[] = [
    {
      name: "entry1",
      value: "value1",
      dimension_value: "dimension1",
    },
    {
      name: "entry2",
      value: "value2",
      dimension_value: "dimension1",
    },
  ];

  const mockExistingDatasource = {
    id: 123,
    name: "test-datasource",
    slug: "test-datasource",
    dimensions: [
      {
        name: "dimension1",
        values: ["value1", "value2"],
      },
    ],
  };

  const mockMigration = {
    id: 123,
    datasource: mockDatasource,
    entries: mockEntries,
  };

  const mockOptions = {
    isDryrun: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update datasource properties successfully", async () => {
    // Arrange
    (api.datasources.get as Mock).mockResolvedValue({
      data: { datasource: mockExistingDatasource },
    });
    (api.datasources.update as Mock).mockResolvedValue({});
    (createRollbackFile as Mock).mockResolvedValue(undefined);

    // Act
    await handleUpdateDatasource(
      { id: 123, datasource: mockDatasource },
      mockOptions,
    );

    // Assert
    expect(api.datasources.get).toHaveBeenCalledWith(123);
    expect(api.datasources.update).toHaveBeenCalledWith({
      ...mockExistingDatasource,
      name: "updated-datasource",
      slug: "updated-datasource",
    });
  });

  it("should update datasource entries successfully", async () => {
    // Arrange
    const mockCreatedEntries = [
      { id: 1, name: "entry1" },
      { id: 2, name: "entry2" },
    ];

    (api.datasources.get as Mock).mockResolvedValue({
      data: { datasource: mockExistingDatasource },
    });
    (addOrUpdateDatasource as Mock).mockResolvedValue([
      mockExistingDatasource,
      mockCreatedEntries,
    ]);
    (createRollbackFile as Mock).mockResolvedValue(undefined);

    // Act
    await handleUpdateDatasource(
      { id: 123, entries: mockEntries },
      mockOptions,
    );

    // Assert
    expect(api.datasources.get).toHaveBeenCalledWith(123);
    expect(addOrUpdateDatasource).toHaveBeenCalledWith(
      {
        name: mockExistingDatasource.name,
        slug: mockExistingDatasource.slug,
      },
      mockEntries.map((entry) => ({
        name: entry.name,
        value: entry.value,
        dimension_value: entry.dimension_value,
      })),
    );
    expect(createRollbackFile).toHaveBeenCalled();
  });

  it("should update both properties and entries successfully", async () => {
    // Arrange
    const mockCreatedEntries = [
      { id: 1, name: "entry1" },
      { id: 2, name: "entry2" },
    ];

    (api.datasources.get as Mock).mockResolvedValue({
      data: { datasource: mockExistingDatasource },
    });
    (api.datasources.update as Mock).mockResolvedValue({});
    (addOrUpdateDatasource as Mock).mockResolvedValue([
      mockExistingDatasource,
      mockCreatedEntries,
    ]);
    (createRollbackFile as Mock).mockResolvedValue(undefined);

    // Act
    await handleUpdateDatasource(mockMigration, mockOptions);

    // Assert
    expect(api.datasources.get).toHaveBeenCalledWith(123);
    expect(api.datasources.update).toHaveBeenCalled();
    expect(addOrUpdateDatasource).toHaveBeenCalled();
    expect(createRollbackFile).toHaveBeenCalled();
  });

  it("should handle dry run correctly", async () => {
    // Arrange
    const dryRunOptions = { isDryrun: true };

    // Act
    await handleUpdateDatasource(mockMigration, dryRunOptions);

    // Assert
    expect(api.datasources.get).not.toHaveBeenCalled();
    expect(api.datasources.update).not.toHaveBeenCalled();
    expect(addOrUpdateDatasource).not.toHaveBeenCalled();
    expect(createRollbackFile).not.toHaveBeenCalled();
  });

  it("should handle missing updates gracefully", async () => {
    // Act
    await handleUpdateDatasource({ id: 123 }, mockOptions);

    // Assert
    expect(api.datasources.get).not.toHaveBeenCalled();
    expect(api.datasources.update).not.toHaveBeenCalled();
    expect(addOrUpdateDatasource).not.toHaveBeenCalled();
    expect(createRollbackFile).not.toHaveBeenCalled();
  });

  it("should handle API errors gracefully", async () => {
    // Arrange
    const error = new Error("API Error");
    (api.datasources.get as Mock).mockRejectedValue(error);

    // Act
    await handleUpdateDatasource(mockMigration, mockOptions);

    // Assert
    expect(api.datasources.get).toHaveBeenCalled();
    expect(api.datasources.update).not.toHaveBeenCalled();
    expect(addOrUpdateDatasource).not.toHaveBeenCalled();
    expect(createRollbackFile).not.toHaveBeenCalled();
  });

  it("should handle update errors gracefully", async () => {
    // Arrange
    const error = new Error("Update Error");
    (api.datasources.get as Mock).mockResolvedValue({
      data: { datasource: mockExistingDatasource },
    });
    (api.datasources.update as Mock).mockRejectedValue(error);

    // Act
    await handleUpdateDatasource(
      { id: 123, datasource: mockDatasource },
      mockOptions,
    );

    // Assert
    expect(api.datasources.get).toHaveBeenCalled();
    expect(api.datasources.update).toHaveBeenCalled();
    expect(addOrUpdateDatasource).not.toHaveBeenCalled();
    expect(createRollbackFile).not.toHaveBeenCalled();
  });

  it("should handle entry update errors gracefully", async () => {
    // Arrange
    const error = new Error("Entry Update Error");
    (api.datasources.get as Mock).mockResolvedValue({
      data: { datasource: mockExistingDatasource },
    });
    (addOrUpdateDatasource as Mock).mockRejectedValue(error);

    // Act
    await handleUpdateDatasource(
      { id: 123, entries: mockEntries },
      mockOptions,
    );

    // Assert
    expect(api.datasources.get).toHaveBeenCalled();
    expect(api.datasources.update).not.toHaveBeenCalled();
    expect(addOrUpdateDatasource).toHaveBeenCalled();
    expect(createRollbackFile).not.toHaveBeenCalled();
  });
});
