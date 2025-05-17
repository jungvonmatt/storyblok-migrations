import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import type { TransformEntriesMigration } from "../../types/migration";
import { handleTransformEntries } from "../../handlers/transformEntries";
import { helper, RunMigrationOptions } from "../../utils/migration";

// Mock the helper and component methods
vi.mock("../../utils/migration", () => ({
  helper: {
    updateComponent: vi.fn(),
  },
}));

describe("handleTransformEntries", () => {
  const mockTransform = vi.fn();
  const mockTransformEntries = vi.fn();

  const mockComponent = {
    transformEntries: mockTransformEntries,
  };

  const mockMigration: TransformEntriesMigration = {
    component: "test-component",
    transform: mockTransform,
    type: "transform-entries",
  };

  const mockOptions = {
    isDryrun: false,
    publish: false,
    publishLanguages: ["en"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (helper.updateComponent as Mock).mockResolvedValue(mockComponent);
  });

  it("should transform entries successfully", async () => {
    // Arrange
    mockTransformEntries.mockResolvedValue(undefined);

    // Act
    await handleTransformEntries(
      mockMigration,
      mockOptions as unknown as RunMigrationOptions,
    );

    // Assert
    expect(helper.updateComponent).toHaveBeenCalledWith("test-component");
    expect(mockTransformEntries).toHaveBeenCalledWith(mockTransform, {
      isDryrun: false,
      publish: false,
      publishLanguages: ["en"],
    });
  });

  it("should handle publish option from migration", async () => {
    // Arrange
    const migrationWithPublish = {
      ...mockMigration,
      publish: true,
    };
    mockTransformEntries.mockResolvedValue(undefined);

    // Act
    await handleTransformEntries(
      migrationWithPublish as unknown as TransformEntriesMigration,
      mockOptions as unknown as RunMigrationOptions,
    );

    // Assert
    expect(mockTransformEntries).toHaveBeenCalledWith(mockTransform, {
      isDryrun: false,
      publish: true,
      publishLanguages: ["en"],
    });
  });

  it("should handle languages option from migration", async () => {
    // Arrange
    const migrationWithLanguages = {
      ...mockMigration,
      languages: ["de", "fr"],
    };
    mockTransformEntries.mockResolvedValue(undefined);
    // Act
    await handleTransformEntries(
      migrationWithLanguages as unknown as TransformEntriesMigration,
      mockOptions as unknown as RunMigrationOptions,
    );

    // Assert
    expect(mockTransformEntries).toHaveBeenCalledWith(mockTransform, {
      isDryrun: false,
      publish: false,
      publishLanguages: ["de", "fr"],
    });
  });

  it("should handle dry run correctly", async () => {
    // Arrange
    const dryRunOptions = {
      isDryrun: true,
      publish: false,
      publishLanguages: ["en"],
    };
    mockTransformEntries.mockResolvedValue(undefined);

    // Act
    await handleTransformEntries(
      mockMigration,
      dryRunOptions as unknown as RunMigrationOptions,
    );

    // Assert
    expect(mockTransformEntries).toHaveBeenCalledWith(mockTransform, {
      isDryrun: true,
      publish: false,
      publishLanguages: ["en"],
    });
  });

  it("should throw error if component is missing", async () => {
    // Arrange
    const migrationWithoutComponent = {
      transform: mockTransform,
    } as unknown as TransformEntriesMigration;

    // Act & Assert
    await expect(
      handleTransformEntries(
        migrationWithoutComponent,
        mockOptions as unknown as RunMigrationOptions,
      ),
    ).rejects.toThrow(
      "Transform migration requires a component name and transform function",
    );
    expect(helper.updateComponent).not.toHaveBeenCalled();
    expect(mockTransformEntries).not.toHaveBeenCalled();
  });

  it("should throw error if transform function is missing", async () => {
    // Arrange
    const migrationWithoutTransform = {
      component: "test-component",
    } as TransformEntriesMigration;

    // Act & Assert
    await expect(
      handleTransformEntries(
        migrationWithoutTransform,
        mockOptions as unknown as RunMigrationOptions,
      ),
    ).rejects.toThrow(
      "Transform migration requires a component name and transform function",
    );
    expect(helper.updateComponent).not.toHaveBeenCalled();
    expect(mockTransformEntries).not.toHaveBeenCalled();
  });

  it("should handle component update errors gracefully", async () => {
    // Arrange
    const error = new Error("Component Update Error");
    (helper.updateComponent as Mock).mockRejectedValue(error);

    // Act & Assert
    await expect(
      handleTransformEntries(
        mockMigration,
        mockOptions as unknown as RunMigrationOptions,
      ),
    ).rejects.toThrow("Component Update Error");
    expect(mockTransformEntries).not.toHaveBeenCalled();
  });

  it("should handle transform entries errors gracefully", async () => {
    // Arrange
    const error = new Error("Transform Error");
    mockTransformEntries.mockRejectedValue(error);

    // Act & Assert
    await expect(
      handleTransformEntries(
        mockMigration,
        mockOptions as unknown as RunMigrationOptions,
      ),
    ).rejects.toThrow("Transform Error");
  });
});
