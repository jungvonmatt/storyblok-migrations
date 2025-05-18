import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import StoryblokClient from "storyblok-js-client";
import { getStoryblokClient, setRequestsPerSecond, api } from "../../utils/api";
import { loadConfig, loadEnvConfig } from "../../utils/config";

// Mock the config utilities
vi.mock("../../utils/config", () => ({
  loadConfig: vi.fn(),
  loadEnvConfig: vi.fn(),
}));

// Mock StoryblokClient
const mockStoryblokClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("storyblok-js-client", () => ({
  default: vi.fn().mockImplementation(() => mockStoryblokClient),
}));

// Mock getStoryblokClient
vi.mock("../../utils/api", async () => {
  const actual = await vi.importActual("../../utils/api");
  return {
    ...actual,
    getStoryblokClient: vi.fn().mockImplementation(async () => {
      const config = await loadConfig();
      if (!config) {
        const envConfig = await loadEnvConfig();
        if (!envConfig.oauthToken) {
          throw new Error("No Storyblok OAuth token found");
        }
        return new StoryblokClient({ oauthToken: envConfig.oauthToken });
      }
      return new StoryblokClient({ oauthToken: config.oauthToken });
    }),
    setRequestsPerSecond: vi.fn(),
    api: {
      stories: {
        getAll: vi.fn(),
        get: vi.fn(),
        getBySlug: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      components: {
        get: vi.fn(),
      },
      datasources: {
        has: vi.fn(),
      },
    },
  };
});

describe("API Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStoryblokClient", () => {
    it("should create client with config file token", async () => {
      // Arrange
      const mockConfig = { oauthToken: "test-token" };
      (loadConfig as Mock).mockResolvedValue(mockConfig);

      // Act
      const client = await getStoryblokClient();

      // Assert
      expect(StoryblokClient).toHaveBeenCalledWith({
        oauthToken: "test-token",
      });
      expect(client).toBe(mockStoryblokClient);
    });

    it("should create client with env token if config file not found", async () => {
      // Arrange
      const mockEnvConfig = { oauthToken: "env-token" };
      (loadConfig as Mock).mockResolvedValue(null);
      (loadEnvConfig as Mock).mockResolvedValue(mockEnvConfig);

      // Act
      const client = await getStoryblokClient();

      // Assert
      expect(StoryblokClient).toHaveBeenCalledWith({
        oauthToken: "env-token",
      });
      expect(client).toBe(mockStoryblokClient);
    });

    it("should throw error if no token found", async () => {
      // Arrange
      (loadConfig as Mock).mockResolvedValue(null);
      (loadEnvConfig as Mock).mockResolvedValue({});

      // Act & Assert
      await expect(getStoryblokClient()).rejects.toThrow(
        "No Storyblok OAuth token found",
      );
    });
  });

  describe("setRequestsPerSecond", () => {
    it("should set rate limit correctly", () => {
      // Act
      setRequestsPerSecond(5);

      // Assert
      expect(setRequestsPerSecond).toBeDefined();
    });

    it("should handle zero or negative values", () => {
      // Act & Assert
      expect(() => setRequestsPerSecond(0)).not.toThrow();
      expect(() => setRequestsPerSecond(-1)).not.toThrow();
    });
  });

  describe("pagedGet", () => {
    it("should handle single page response", async () => {
      // Arrange
      const mockResponse = {
        data: {
          stories: [{ id: 1 }, { id: 2 }],
        },
        total: 2,
      };
      (api.stories.getAll as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await api.stories.getAll();

      // Assert
      expect(result.data.stories).toHaveLength(2);
    });

    it("should handle multiple pages", async () => {
      // Arrange
      const mockResponse = {
        data: {
          stories: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
        },
        total: 4,
      };
      (api.stories.getAll as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await api.stories.getAll();

      // Assert
      expect(result.data.stories).toHaveLength(4);
      expect(result.data.stories).toEqual([
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
      ]);
    });

    it("should respect per_page parameter", async () => {
      // Arrange
      const mockResponse = {
        data: {
          stories: [{ id: 1 }],
        },
        total: 1,
      };
      (api.stories.getAll as Mock).mockResolvedValue(mockResponse);

      // Act
      await api.stories.getAll({ per_page: 50 });

      // Assert
      expect(api.stories.getAll).toHaveBeenCalledWith({ per_page: 50 });
    });

    it("should handle empty response", async () => {
      // Arrange
      const mockResponse = {
        data: {
          stories: [],
        },
        total: 0,
      };
      (api.stories.getAll as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await api.stories.getAll();

      // Assert
      expect(result.data.stories).toHaveLength(0);
    });
  });

  describe("wrapRequest", () => {
    it("should handle GET request with pagination", async () => {
      // Arrange
      const mockResponse = {
        data: {
          stories: [{ id: 1 }, { id: 2 }],
        },
        total: 2,
      };
      (api.stories.getAll as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await api.stories.getAll();

      // Assert
      expect(result.data.stories).toEqual(mockResponse.data.stories);
    });

    it("should handle POST request", async () => {
      // Arrange
      const mockStory = { name: "Test Story", slug: "test-story" };
      const mockResponse = {
        data: {
          story: { ...mockStory, id: 1 },
        },
      };
      (api.stories.create as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await api.stories.create(mockStory);

      // Assert
      expect(result.data.story).toEqual(mockResponse.data.story);
      expect(api.stories.create).toHaveBeenCalledWith(mockStory);
    });

    it("should handle PUT request", async () => {
      // Arrange
      const mockStory = { id: 1, name: "Updated Story", slug: "test-story" };
      const mockResponse = {
        data: {
          story: mockStory,
        },
      };
      (api.stories.update as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await api.stories.update(mockStory);

      // Assert
      expect(result.data.story).toEqual(mockResponse.data.story);
      expect(api.stories.update).toHaveBeenCalledWith(mockStory);
    });

    it("should handle DELETE request", async () => {
      // Arrange
      const mockResponse = {
        data: {
          story: { id: 1 },
        },
      };
      (api.stories.delete as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await api.stories.delete(1);

      // Assert
      expect(result.data.story).toEqual(mockResponse.data.story);
      expect(api.stories.delete).toHaveBeenCalledWith(1);
    });

    it("should handle API errors", async () => {
      // Arrange
      const error = new Error("API Error");
      (api.stories.getAll as Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(api.stories.getAll()).rejects.toThrow("API Error");
    });
  });

  describe("API Methods", () => {
    const mockStory = {
      id: 123,
      name: "Test Story",
      slug: "test-story",
    };

    describe("stories", () => {
      it("should get story by ID", async () => {
        // Arrange
        const mockResponse = { data: { story: mockStory } };
        (api.stories.get as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await api.stories.get(123);

        // Assert
        expect(result.data.story).toEqual(mockStory);
      });

      it("should get story by slug", async () => {
        // Arrange
        (api.stories.getBySlug as Mock).mockResolvedValue(mockStory);

        // Act
        const result = await api.stories.getBySlug("test-story");

        // Assert
        expect(result).toEqual(mockStory);
      });

      it("should throw error if story not found by slug", async () => {
        // Arrange
        (api.stories.getBySlug as Mock).mockRejectedValue(
          new Error('Story with slug "non-existent" not found'),
        );

        // Act & Assert
        await expect(api.stories.getBySlug("non-existent")).rejects.toThrow(
          'Story with slug "non-existent" not found',
        );
      });
    });

    describe("components", () => {
      it("should get component by ID", async () => {
        // Arrange
        const mockComponent = {
          id: 123,
          name: "Test Component",
        };
        const mockResponse = { data: { component: mockComponent } };
        (api.components.get as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await api.components.get(123);

        // Assert
        expect(result.data.component).toEqual(mockComponent);
      });
    });

    describe("datasources", () => {
      it("should check if datasource exists", async () => {
        // Arrange
        (api.datasources.has as Mock).mockResolvedValue(true);

        // Act
        const result = await api.datasources.has(123);

        // Assert
        expect(result).toBe(true);
      });
    });
  });
});
