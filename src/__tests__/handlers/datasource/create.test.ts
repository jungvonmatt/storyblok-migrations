import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { handleCreateDatasource } from "../../../handlers/datasource/create";
import { api } from "../../../utils/api";
import { addOrUpdateDatasource } from "../../../utils/storyblok";
import { DatasourceMigration } from "../../../types/migration";
import { IPendingDataSourceEntry } from "../../../types/IDataSource";

// Mock the API and utility functions
vi.mock("../../../utils/api", () => ({
  api: {
    datasources: {
      getAll: vi.fn(),
    },
  },
}));

vi.mock("../../../utils/storyblok", () => ({
  addOrUpdateDatasource: vi.fn(),
}));

describe("handleCreateDatasource", () => {
  const mockDatasource: DatasourceMigration = {
    name: "test-datasource",
    slug: "test-datasource",
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

  const mockMigration = {
    datasource: mockDatasource,
    entries: mockEntries,
  };

  const mockOptions = {
    isDryrun: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new datasource with entries successfully", async () => {
    // Arrange
    const mockExistingDatasources = {
      data: {
        datasources: [],
      },
    };

    const mockCreatedDatasource = {
      id: 123,
      name: "test-datasource",
      slug: "test-datasource",
    };

    const mockCreatedEntries = [
      { id: 1, name: "entry1" },
      { id: 2, name: "entry2" },
    ];

    (api.datasources.getAll as Mock).mockResolvedValue(mockExistingDatasources);
    (addOrUpdateDatasource as Mock).mockResolvedValue([
      mockCreatedDatasource,
      mockCreatedEntries,
    ]);

    // Act
    await handleCreateDatasource(mockMigration, mockOptions);

    // Assert
    expect(api.datasources.getAll).toHaveBeenCalled();
    expect(addOrUpdateDatasource).toHaveBeenCalledWith(
      mockDatasource,
      mockEntries.map((entry) => ({
        name: entry.name,
        value: entry.value,
        dimension_value: entry.dimension_value,
      })),
    );
  });

  it("should create a new datasource without entries successfully", async () => {
    // Arrange
    const mockExistingDatasources = {
      data: {
        datasources: [],
      },
    };

    const mockCreatedDatasource = {
      id: 123,
      name: "test-datasource",
      slug: "test-datasource",
    };

    const mockCreatedEntries: IPendingDataSourceEntry[] = [];

    (api.datasources.getAll as Mock).mockResolvedValue(mockExistingDatasources);
    (addOrUpdateDatasource as Mock).mockResolvedValue([
      mockCreatedDatasource,
      mockCreatedEntries,
    ]);

    // Act
    await handleCreateDatasource({ datasource: mockDatasource }, mockOptions);

    // Assert
    expect(api.datasources.getAll).toHaveBeenCalled();
    expect(addOrUpdateDatasource).toHaveBeenCalledWith(mockDatasource, []);
  });

  it("should handle dry run correctly", async () => {
    // Arrange
    const dryRunOptions = { isDryrun: true };

    // Act
    await handleCreateDatasource(mockMigration, dryRunOptions);

    // Assert
    expect(api.datasources.getAll).not.toHaveBeenCalled();
    expect(addOrUpdateDatasource).not.toHaveBeenCalled();
  });

  it("should skip creation if datasource already exists by name", async () => {
    // Arrange
    const mockExistingDatasources = {
      data: {
        datasources: [
          {
            name: "test-datasource",
            slug: "different-slug",
          },
        ],
      },
    };

    (api.datasources.getAll as Mock).mockResolvedValue(mockExistingDatasources);

    // Act
    await handleCreateDatasource(mockMigration, mockOptions);

    // Assert
    expect(api.datasources.getAll).toHaveBeenCalled();
    expect(addOrUpdateDatasource).not.toHaveBeenCalled();
  });

  it("should skip creation if datasource already exists by slug", async () => {
    // Arrange
    const mockExistingDatasources = {
      data: {
        datasources: [
          {
            name: "different-name",
            slug: "test-datasource",
          },
        ],
      },
    };

    (api.datasources.getAll as Mock).mockResolvedValue(mockExistingDatasources);

    // Act
    await handleCreateDatasource(mockMigration, mockOptions);

    // Assert
    expect(api.datasources.getAll).toHaveBeenCalled();
    expect(addOrUpdateDatasource).not.toHaveBeenCalled();
  });

  it("should handle API errors gracefully", async () => {
    // Arrange
    const error = new Error("API Error");
    (api.datasources.getAll as Mock).mockRejectedValue(error);

    // Act
    await handleCreateDatasource(mockMigration, mockOptions);

    // Assert
    expect(api.datasources.getAll).toHaveBeenCalled();
    expect(addOrUpdateDatasource).not.toHaveBeenCalled();
  });

  it("should handle creation errors gracefully", async () => {
    // Arrange
    const mockExistingDatasources = {
      data: {
        datasources: [],
      },
    };

    const error = new Error("Creation Error");
    (api.datasources.getAll as Mock).mockResolvedValue(mockExistingDatasources);
    (addOrUpdateDatasource as Mock).mockRejectedValue(error);

    // Act
    await handleCreateDatasource(mockMigration, mockOptions);

    // Assert
    expect(api.datasources.getAll).toHaveBeenCalled();
    expect(addOrUpdateDatasource).toHaveBeenCalled();
  });
});
