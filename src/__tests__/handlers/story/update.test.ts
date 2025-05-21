import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { handleUpdateStory } from "../../../handlers/story/update";
import { api } from "../../../utils/api";
import { createRollbackFile } from "../../../utils/storyblok";
import { StoryMigration } from "../../../types/migration";

// Mock the API and utility functions
vi.mock("../../../utils/api", () => ({
  api: {
    stories: {
      get: vi.fn(),
      getBySlug: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("../../../utils/storyblok", () => ({
  createRollbackFile: vi.fn(),
}));

describe("handleUpdateStory", () => {
  const mockStory = {
    id: 123,
    name: "Original Story",
    slug: "original-story",
    full_slug: "original-story",
    parent_id: 0,
    content: {
      component: "test-component",
      field1: "value1",
      field2: "value2",
    },
  };

  const mockStoryUpdate: Partial<StoryMigration> = {
    name: "Updated Story",
    slug: "updated-story",
    parent_id: 456,
    content: {
      component: "test-component",
      field1: "new-value1",
      field3: "value3",
    },
  };

  const mockMigration = {
    id: 123,
    story: mockStoryUpdate,
  };

  const mockOptions = {
    isDryrun: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update a story by ID successfully", async () => {
    // Arrange
    (api.stories.get as Mock).mockResolvedValue({
      data: { story: mockStory },
    });
    (api.stories.update as Mock).mockResolvedValue({});
    (createRollbackFile as Mock).mockResolvedValue(undefined);

    // Act
    await handleUpdateStory(mockMigration, mockOptions);

    // Assert
    expect(api.stories.get).toHaveBeenCalledWith(123);
    expect(api.stories.update).toHaveBeenCalledWith(
      {
        ...mockStory,
        name: "Updated Story",
        slug: "updated-story",
        parent_id: 456,
        content: {
          component: "test-component",
          field1: "new-value1",
          field2: "value2",
          field3: "value3",
        },
      },
      {},
    );
  });

  it("should update a story by slug successfully", async () => {
    // Arrange
    const migrationWithSlug = {
      id: "test-story",
      story: mockStoryUpdate,
    };
    (api.stories.getBySlug as Mock).mockResolvedValue(mockStory);
    (api.stories.update as Mock).mockResolvedValue({});
    (createRollbackFile as Mock).mockResolvedValue(undefined);

    // Act
    await handleUpdateStory(migrationWithSlug, mockOptions);

    // Assert
    expect(api.stories.getBySlug).toHaveBeenCalledWith("test-story");
    expect(api.stories.update).toHaveBeenCalled();
    expect(createRollbackFile).toHaveBeenCalledWith(
      [
        {
          id: mockStory.id,
          full_slug: mockStory.full_slug,
          content: mockStory.content,
          name: mockStory.name,
          slug: mockStory.slug,
          parent_id: mockStory.parent_id,
        },
      ],
      "story_test_story",
      "update",
    );
  });

  it("should handle publish option", async () => {
    // Arrange
    const storyWithPublish = {
      ...mockStoryUpdate,
      publish: true,
    };
    (api.stories.get as Mock).mockResolvedValue({
      data: { story: mockStory },
    });
    (api.stories.update as Mock).mockResolvedValue({});

    // Act
    await handleUpdateStory({ id: 123, story: storyWithPublish }, mockOptions);

    // Assert
    expect(api.stories.update).toHaveBeenCalledWith(expect.any(Object), {
      publish: "1",
    });
  });

  it("should handle release_id option", async () => {
    // Arrange
    const storyWithRelease = {
      ...mockStoryUpdate,
      release_id: 789,
    };
    (api.stories.get as Mock).mockResolvedValue({
      data: { story: mockStory },
    });
    (api.stories.update as Mock).mockResolvedValue({});

    // Act
    await handleUpdateStory({ id: 123, story: storyWithRelease }, mockOptions);

    // Assert
    expect(api.stories.update).toHaveBeenCalledWith(expect.any(Object), {
      release_id: 789,
    });
  });

  it("should handle lang option", async () => {
    // Arrange
    const storyWithLang = {
      ...mockStoryUpdate,
      lang: "de",
    };
    (api.stories.get as Mock).mockResolvedValue({
      data: { story: mockStory },
    });
    (api.stories.update as Mock).mockResolvedValue({});

    // Act
    await handleUpdateStory({ id: 123, story: storyWithLang }, mockOptions);

    // Assert
    expect(api.stories.update).toHaveBeenCalledWith(expect.any(Object), {
      lang: "de",
    });
  });

  it("should handle dry run correctly", async () => {
    // Arrange
    const dryRunOptions = { isDryrun: true };

    // Act
    await handleUpdateStory(mockMigration, dryRunOptions);

    // Assert
    expect(api.stories.get).not.toHaveBeenCalled();
    expect(api.stories.update).not.toHaveBeenCalled();
    expect(createRollbackFile).not.toHaveBeenCalled();
  });

  it("should throw error if story not found", async () => {
    // Arrange
    (api.stories.get as Mock).mockResolvedValue({
      data: { story: null },
    });

    // Act & Assert
    await expect(handleUpdateStory(mockMigration, mockOptions)).rejects.toThrow(
      'Story "123" not found',
    );
  });

  it("should handle API errors gracefully", async () => {
    // Arrange
    const error = new Error("API Error");
    (api.stories.get as Mock).mockRejectedValue(error);

    // Act & Assert
    await expect(handleUpdateStory(mockMigration, mockOptions)).rejects.toThrow(
      "API Error",
    );
  });

  it("should handle update errors gracefully", async () => {
    // Arrange
    (api.stories.get as Mock).mockResolvedValue({
      data: { story: mockStory },
    });
    const error = new Error("Update Error");
    (api.stories.update as Mock).mockRejectedValue(error);

    // Act & Assert
    await expect(handleUpdateStory(mockMigration, mockOptions)).rejects.toThrow(
      "Update Error",
    );
  });
});
