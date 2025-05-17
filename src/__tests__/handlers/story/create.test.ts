import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { handleCreateStory } from "../../../handlers/story/create";
import { api } from "../../../utils/api";
import { StoryMigration } from "../../../types/migration";

// Mock the API
vi.mock("../../../utils/api", () => ({
  api: {
    stories: {
      getAll: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("handleCreateStory", () => {
  const mockStory: StoryMigration = {
    name: "Test Story",
    slug: "test-story",
    content: {
      component: "test-component",
      field1: "value1",
      field2: "value2",
    },
  };

  const mockMigration = {
    story: mockStory,
  };

  const mockOptions = {
    isDryrun: false,
  };

  const mockCreatedStory = {
    id: 123,
    name: "Test Story",
    slug: "test-story",
    full_slug: "test-story",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new story successfully", async () => {
    // Arrange
    (api.stories.getAll as Mock).mockResolvedValue({
      data: { stories: [] },
    });
    (api.stories.create as Mock).mockResolvedValue({
      data: { story: mockCreatedStory },
    });

    // Act
    await handleCreateStory(mockMigration, mockOptions);

    // Assert
    expect(api.stories.getAll).toHaveBeenCalledWith({
      starts_with: "test-story",
    });
    expect(api.stories.create).toHaveBeenCalledWith(
      {
        name: "Test Story",
        slug: "test-story",
        content: {
          component: "test-component",
          field1: "value1",
          field2: "value2",
        },
      },
      {},
    );
  });

  it("should create a story with publish option", async () => {
    // Arrange
    const storyWithPublish = {
      ...mockStory,
      publish: true,
    };
    (api.stories.getAll as Mock).mockResolvedValue({
      data: { stories: [] },
    });
    (api.stories.create as Mock).mockResolvedValue({
      data: { story: mockCreatedStory },
    });

    // Act
    await handleCreateStory({ story: storyWithPublish }, mockOptions);

    // Assert
    expect(api.stories.create).toHaveBeenCalledWith(
      {
        name: "Test Story",
        slug: "test-story",
        content: {
          component: "test-component",
          field1: "value1",
          field2: "value2",
        },
      },
      { publish: "1" },
    );
  });

  it("should create a story with release_id", async () => {
    // Arrange
    const storyWithRelease = {
      ...mockStory,
      release_id: 456,
    };
    (api.stories.getAll as Mock).mockResolvedValue({
      data: { stories: [] },
    });
    (api.stories.create as Mock).mockResolvedValue({
      data: { story: mockCreatedStory },
    });

    // Act
    await handleCreateStory({ story: storyWithRelease }, mockOptions);

    // Assert
    expect(api.stories.create).toHaveBeenCalledWith(
      {
        name: "Test Story",
        slug: "test-story",
        content: {
          component: "test-component",
          field1: "value1",
          field2: "value2",
        },
      },
      { release_id: 456 },
    );
  });

  it("should handle dry run correctly", async () => {
    // Arrange
    const dryRunOptions = { isDryrun: true };

    // Act
    await handleCreateStory(mockMigration, dryRunOptions);

    // Assert
    expect(api.stories.getAll).not.toHaveBeenCalled();
    expect(api.stories.create).not.toHaveBeenCalled();
  });

  it("should skip creation if story exists by slug", async () => {
    // Arrange
    (api.stories.getAll as Mock).mockResolvedValue({
      data: {
        stories: [
          {
            name: "Different Name",
            slug: "test-story",
            full_slug: "test-story",
          },
        ],
      },
    });

    // Act
    await handleCreateStory(mockMigration, mockOptions);

    // Assert
    expect(api.stories.getAll).toHaveBeenCalled();
    expect(api.stories.create).not.toHaveBeenCalled();
  });

  it("should skip creation if story exists by name", async () => {
    // Arrange
    (api.stories.getAll as Mock).mockResolvedValue({
      data: {
        stories: [
          {
            name: "Test Story",
            slug: "different-slug",
            full_slug: "different-slug",
          },
        ],
      },
    });

    // Act
    await handleCreateStory(mockMigration, mockOptions);

    // Assert
    expect(api.stories.getAll).toHaveBeenCalled();
    expect(api.stories.create).not.toHaveBeenCalled();
  });

  it("should generate slug from name if not provided", async () => {
    // Arrange
    const storyWithoutSlug = {
      ...mockStory,
      slug: undefined,
    };
    (api.stories.getAll as Mock).mockResolvedValue({
      data: { stories: [] },
    });
    (api.stories.create as Mock).mockResolvedValue({
      data: { story: mockCreatedStory },
    });

    // Act
    await handleCreateStory({ story: storyWithoutSlug }, mockOptions);

    // Assert
    expect(api.stories.getAll).toHaveBeenCalledWith({
      starts_with: "test-story",
    });
    expect(api.stories.create).toHaveBeenCalledWith(
      {
        name: "Test Story",
        slug: "test-story",
        content: {
          component: "test-component",
          field1: "value1",
          field2: "value2",
        },
      },
      {},
    );
  });

  it("should handle API errors", async () => {
    // Arrange
    const error = new Error("API Error");
    (api.stories.getAll as Mock).mockRejectedValue(error);

    // Act & Assert
    await expect(handleCreateStory(mockMigration, mockOptions)).rejects.toThrow(
      "API Error",
    );
  });
});
