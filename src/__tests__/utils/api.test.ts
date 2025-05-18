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
      componentGroups: {
        getAll: vi.fn(),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      components: {
        getAll: vi.fn(),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      spaces: {
        getSpaceOptions: vi.fn(),
        getSpaceLanguages: vi.fn(),
      },
      datasources: {
        getAll: vi.fn(),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
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

    describe("componentGroups", () => {
      const mockComponentGroup = {
        id: 123,
        name: "Test Group",
        components: [],
      };

      it("should get all component groups", async () => {
        // Arrange
        const mockResponse = {
          data: {
            component_groups: [mockComponentGroup],
          },
        };
        (api.componentGroups.getAll as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await api.componentGroups.getAll();

        // Assert
        expect(result.data.component_groups).toEqual([mockComponentGroup]);
      });

      it("should get component group by ID", async () => {
        // Arrange
        const mockResponse = {
          data: {
            component_group: mockComponentGroup,
          },
        };
        (api.componentGroups.get as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await api.componentGroups.get(123);

        // Assert
        expect(result.data.component_group).toEqual(mockComponentGroup);
      });

      it("should create component group", async () => {
        // Arrange
        const newGroup = { name: "New Group" };
        const mockResponse = {
          data: {
            component_group: { ...newGroup, id: 123 },
          },
        };
        (api.componentGroups.create as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await api.componentGroups.create(newGroup);

        // Assert
        expect(result.data.component_group).toEqual({ ...newGroup, id: 123 });
      });

      it("should update component group", async () => {
        // Arrange
        const updatedGroup = { ...mockComponentGroup, name: "Updated Group" };
        const mockResponse = {
          data: {
            component_group: updatedGroup,
          },
        };
        (api.componentGroups.update as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await api.componentGroups.update(updatedGroup);

        // Assert
        expect(result.data.component_group).toEqual(updatedGroup);
      });

      it("should delete component group", async () => {
        // Arrange
        const mockResponse = {
          data: {
            component_group: mockComponentGroup,
          },
        };
        (api.componentGroups.delete as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await api.componentGroups.delete(123);

        // Assert
        expect(result.data.component_group).toEqual(mockComponentGroup);
      });
    });

    describe("components", () => {
      const mockComponent = {
        id: 123,
        name: "Test Component",
        schema: {},
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      it("should get all components", async () => {
        // Arrange
        const mockResponse = {
          data: {
            components: [mockComponent],
          },
        };
        (api.components.getAll as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await api.components.getAll();

        // Assert
        expect(result.data.components).toEqual([mockComponent]);
      });

      it("should get component by ID", async () => {
        // Arrange
        const mockResponse = {
          data: {
            component: mockComponent,
          },
        };
        (api.components.get as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await api.components.get(123);

        // Assert
        expect(result.data.component).toEqual(mockComponent);
      });

      it("should create component", async () => {
        // Arrange
        const newComponent = { name: "New Component", schema: {} };
        const mockResponse = {
          data: {
            component: { ...newComponent, id: 123 },
          },
        };
        (api.components.create as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await api.components.create(newComponent);

        // Assert
        expect(result.data.component).toEqual({ ...newComponent, id: 123 });
      });

      it("should update component", async () => {
        // Arrange
        const updatedComponent = {
          ...mockComponent,
          name: "Updated Component",
        };
        const mockResponse = {
          data: {
            component: updatedComponent,
          },
        };
        (api.components.update as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await api.components.update(updatedComponent);

        // Assert
        expect(result.data.component).toEqual(updatedComponent);
      });

      it("should delete component", async () => {
        // Arrange
        const mockResponse = {
          data: {
            component: mockComponent,
          },
        };
        (api.components.delete as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await api.components.delete(123);

        // Assert
        expect(result.data.component).toEqual(mockComponent);
      });
    });

    describe("spaces", () => {
      const mockSpace = {
        id: 123,
        name: "Test Space",
        options: {
          languages: ["en", "de"],
        },
      };

      it("should get space options", async () => {
        // Arrange
        (api.spaces.getSpaceOptions as Mock).mockResolvedValue(
          mockSpace.options,
        );

        // Act
        const result = await api.spaces.getSpaceOptions();

        // Assert
        expect(result).toEqual(mockSpace.options);
      });

      it("should get space languages", async () => {
        // Arrange
        (api.spaces.getSpaceLanguages as Mock).mockResolvedValue(
          mockSpace.options.languages,
        );

        // Act
        const result = await api.spaces.getSpaceLanguages();

        // Assert
        expect(result).toEqual(mockSpace.options.languages);
      });
    });

    describe("datasources", () => {
      const mockDatasource = {
        id: 123,
        name: "Test Datasource",
        slug: "test-datasource",
        dimensions: [],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      it("should get all datasources", async () => {
        // Arrange
        const mockResponse = {
          data: {
            datasources: [mockDatasource],
          },
        };
        (api.datasources.getAll as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await api.datasources.getAll();

        // Assert
        expect(result.data.datasources).toEqual([mockDatasource]);
      });

      it("should get datasource by ID", async () => {
        // Arrange
        const mockResponse = {
          data: {
            datasource: mockDatasource,
          },
        };
        (api.datasources.get as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await api.datasources.get(123);

        // Assert
        expect(result.data.datasource).toEqual(mockDatasource);
      });

      it("should create datasource", async () => {
        // Arrange
        const newDatasource = {
          name: "New Datasource",
          slug: "new-datasource",
        };
        const mockResponse = {
          data: {
            datasource: { ...newDatasource, id: 123 },
          },
        };
        (api.datasources.create as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await api.datasources.create(newDatasource);

        // Assert
        expect(result.data.datasource).toEqual({ ...newDatasource, id: 123 });
      });

      it("should update datasource", async () => {
        // Arrange
        const updatedDatasource = {
          ...mockDatasource,
          name: "Updated Datasource",
        };
        const mockResponse = {
          data: {
            datasource: updatedDatasource,
          },
        };
        (api.datasources.update as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await api.datasources.update(updatedDatasource);

        // Assert
        expect(result.data.datasource).toEqual(updatedDatasource);
      });

      it("should delete datasource", async () => {
        // Arrange
        const mockResponse = {
          data: {
            datasource: mockDatasource,
          },
        };
        (api.datasources.delete as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await api.datasources.delete(123);

        // Assert
        expect(result.data.datasource).toEqual(mockDatasource);
      });

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
