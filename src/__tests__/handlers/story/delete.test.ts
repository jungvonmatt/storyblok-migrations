import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { handleDeleteStory } from "../../../handlers/story/delete";
import { api } from "../../../utils/api";

// Mock the API
vi.mock("../../../utils/api", () => ({
  api: {
    stories: {
      get: vi.fn(),
      getBySlug: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("handleDeleteStory", () => {
  const mockStory = {
    id: 123,
    name: "Test Story",
    slug: "test-story",
    full_slug: "test-story",
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

  it("should delete a story by ID successfully", async () => {
    // Arrange
    (api.stories.get as Mock).mockResolvedValue({
      data: { story: mockStory },
    });
    (api.stories.delete as Mock).mockResolvedValue({});

    // Act
    await handleDeleteStory(mockMigration, mockOptions);

    // Assert
    expect(api.stories.get).toHaveBeenCalledWith(123);
    expect(api.stories.delete).toHaveBeenCalledWith(123);
  });

  it("should delete a story by slug successfully", async () => {
    // Arrange
    const migrationWithSlug = {
      id: "test-story",
    };
    (api.stories.getBySlug as Mock).mockResolvedValue(mockStory);
    (api.stories.delete as Mock).mockResolvedValue({});

    // Act
    await handleDeleteStory(migrationWithSlug, mockOptions);

    // Assert
    expect(api.stories.getBySlug).toHaveBeenCalledWith("test-story");
    expect(api.stories.delete).toHaveBeenCalledWith(123);
  });

  it("should handle dry run correctly", async () => {
    // Arrange
    const dryRunOptions = { isDryrun: true };

    // Act
    await handleDeleteStory(mockMigration, dryRunOptions);

    // Assert
    expect(api.stories.get).not.toHaveBeenCalled();
    expect(api.stories.delete).not.toHaveBeenCalled();
  });

  it("should throw error if story not found", async () => {
    // Arrange
    (api.stories.get as Mock).mockResolvedValue({
      data: { story: null },
    });

    // Act & Assert
    await expect(handleDeleteStory(mockMigration, mockOptions)).rejects.toThrow(
      'Story "123" not found',
    );
    expect(api.stories.delete).not.toHaveBeenCalled();
  });

  it("should throw error if story has no ID", async () => {
    // Arrange
    const storyWithoutId = {
      name: "Test Story",
      slug: "test-story",
      full_slug: "test-story",
    };
    (api.stories.get as Mock).mockResolvedValue({
      data: { story: storyWithoutId },
    });

    // Act & Assert
    await expect(handleDeleteStory(mockMigration, mockOptions)).rejects.toThrow(
      'Story "123" has no ID',
    );
    expect(api.stories.delete).not.toHaveBeenCalled();
  });

  it("should handle API errors gracefully", async () => {
    // Arrange
    const error = new Error("API Error");
    (api.stories.get as Mock).mockRejectedValue(error);

    // Act & Assert
    await expect(handleDeleteStory(mockMigration, mockOptions)).rejects.toThrow(
      "API Error",
    );
  });

  it("should handle delete errors gracefully", async () => {
    // Arrange
    (api.stories.get as Mock).mockResolvedValue({
      data: { story: mockStory },
    });
    const error = new Error("Delete Error");
    (api.stories.delete as Mock).mockRejectedValue(error);

    // Act & Assert
    await expect(handleDeleteStory(mockMigration, mockOptions)).rejects.toThrow(
      "Delete Error",
    );
  });
});
