/* eslint-disable @typescript-eslint/no-explicit-any */
import StoryblokClient, { ISbResult } from "storyblok-js-client";
import { loadConfig, loadEnvConfig } from "../utils/config";
import { IComponent, IPendingComponent } from "../types/IComponent";
import { IStory, IPendingStory } from "../types/stories";
import { ISpace } from "../types/spaces";
import {
  IDataSource,
  IDataSourceEntry,
  IPendingDataSource,
  IPendingDataSourceEntry,
} from "../types/IDataSource";
import {
  IComponentGroup,
  IPendingComponentGroup,
} from "../types/IComponentGroup";

// Helper function to create a request queue with rate limiting
const createRequestQueue = (initialRequestsPerSecond = 3) => {
  const queue: Array<() => Promise<any>> = [];
  let processing = false;
  let interval = Math.floor(1000 / initialRequestsPerSecond);
  let lastRequestTime = 0;

  const setRequestsPerSecond = (requestsPerSecond: number): void => {
    if (requestsPerSecond <= 0) return;
    interval = Math.floor(1000 / requestsPerSecond);
    console.log(
      `Rate limit set to ${requestsPerSecond} requests per second (${interval}ms between requests)`,
    );
  };

  const processQueue = async (): Promise<void> => {
    if (processing || queue.length === 0) return;

    processing = true;

    while (queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;

      // Wait if needed to respect the rate limit
      if (timeSinceLastRequest < interval) {
        const waitTime = interval - timeSinceLastRequest;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }

      // Execute the next request
      const request = queue.shift();
      if (request) {
        lastRequestTime = Date.now();
        try {
          await request();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          // Don't log the error here - let it propagate to the actual handler
        }
      }
    }

    processing = false;
  };

  const add = async <T>(fn: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
      queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      });

      if (!processing) {
        processQueue();
      }
    });
  };

  return {
    add,
    setRequestsPerSecond,
  };
};

// Create a global request queue instance
const requestQueue = createRequestQueue();

/**
 * Sets the number of requests per second to limit API calls
 * @param requestsPerSecond Number of requests per second (default: 3)
 */
export function setRequestsPerSecond(requestsPerSecond: number): void {
  requestQueue.setRequestsPerSecond(requestsPerSecond);
}

/**
 * Creates a new instance of the Storyblok client using configuration from either
 * the config file (.storyblokrc.json) or environment variables.
 *
 * @throws {Error} If no OAuth token is found in either the config file or environment variables
 * @returns {Promise<StoryblokClient>} A configured Storyblok client instance
 *
 * @example
 * ```typescript
 * const client = await getStoryblokClient();
 * const { data } = await client.get('stories');
 * ```
 */
export async function getStoryblokClient(): Promise<StoryblokClient> {
  // Try to load config from config file first
  const config = await loadConfig();

  // If no config file found, try environment variables
  const envConfig = config || (await loadEnvConfig());

  if (!envConfig.oauthToken) {
    throw new Error(
      "No Storyblok OAuth token found. Please run the config command first.",
    );
  }

  return new StoryblokClient({
    oauthToken: envConfig.oauthToken,
  });
}

type IResult<T = any> = Omit<ISbResult, "data"> & {
  data: T;
};
type RequestMethod = "post" | "get" | "put" | "delete";

type PagedOptions = {
  page?: number;
  perPage?: number;
  aggregatedResponse?: ISbResult | null;
  url: string;
  options?: Record<string, any>;
};

/**
 * Handles paginated GET requests to the Storyblok API, automatically fetching all pages
 * and combining the results into a single response.
 *
 * @param {StoryblokClient} client - Initialized Storyblok client instance
 * @param {PagedOptions} params - Pagination and request parameters
 * @param {number} [params.page=1] - Current page number
 * @param {number} [params.perPage=100] - Number of items per page (max 100)
 * @param {ISbResult | null} [params.aggregatedResponse] - Accumulated response from previous pages
 * @param {string} params.url - API endpoint URL
 * @param {Record<string, any>} [params.options={}] - Additional query parameters
 *
 * @returns {Promise<ISbResult>} Combined response with all pages of data aggregated
 *
 * @example
 * ```typescript
 * const allStories = await pagedGet(client, {
 *   url: 'spaces/123/stories',
 *   options: { sort_by: 'created_at:desc' }
 * });
 * // Returns all stories across all pages
 * ```
 */
const pagedGet = async (
  client: StoryblokClient,
  params: PagedOptions,
): Promise<ISbResult> => {
  const { url, page = 1, perPage = 100, options = {} } = params;
  let aggregatedResponse = params?.aggregatedResponse;

  // Use the request queue to throttle requests
  const response = await requestQueue.add(() =>
    client.get(url, {
      ...options,
      page,
      per_page: Math.min(100, perPage), // Ensure we don't exceed max of 100
    }),
  );

  if (aggregatedResponse) {
    aggregatedResponse.data = {
      datasource_entries: [
        ...(aggregatedResponse?.data?.datasource_entries ?? []),
        ...(response?.data?.datasource_entries ?? []),
      ],
      stories: [
        ...(aggregatedResponse?.data?.stories ?? []),
        ...(response?.data?.stories ?? []),
      ],
    };
  } else {
    aggregatedResponse = response;
  }

  if (response.total > page * perPage) {
    return pagedGet(client, {
      ...params,
      page: page + 1,
      aggregatedResponse,
    });
  }

  return aggregatedResponse;
};

/**
 * Wraps API requests to the Storyblok Management API with proper authentication,
 * space context, and automatic pagination for GET requests.
 *
 * @template T - Type of the response data
 * @param {string} [path=""] - API endpoint path (without space prefix)
 * @param {RequestMethod} method - HTTP method (get, post, put, delete)
 * @param {Record<string, any>} [params={}] - Request parameters or body data
 *
 * @returns {Promise<IResult<T>>} API response with typed data
 * @throws {Error} If authentication fails or API request errors
 *
 * @example
 * ```typescript
 * // GET request with automatic pagination
 * const { data } = await wrapRequest<{ components: IComponent[] }>(
 *   'components/',
 *   'get',
 *   { per_page: 100 }
 * );
 *
 * // POST request
 * await wrapRequest<{ component: IComponent }>(
 *   'components/',
 *   'post',
 *   { component: newComponent }
 * );
 * ```
 */
const wrapRequest = async <T = any>(
  path: string = "",
  method: RequestMethod,
  params: Record<string, any> = {},
): Promise<IResult<T>> => {
  const client = await getStoryblokClient();
  const config = await loadConfig();

  if (method === "get") {
    const response = await pagedGet(client, {
      url: `spaces/${config?.spaceId}/${path}`,
      options: params,
    });

    return response as IResult<T>;
  }

  // For non-GET requests, use the request queue
  const response = await requestQueue.add(() =>
    client[method](`spaces/${config?.spaceId}/${path}`, params),
  );

  return response as unknown as IResult<T>;
};

/**
 * API methods for managing Storyblok stories
 */
export type CreateStoryPayload = {
  release_id?: number;
  publish?: "1";
};

export type UpdateStoryPayload = CreateStoryPayload & {
  group_id?: number;
  force_update?: "1";
  lang?: string;
};

export const stories = {
  getAll(params: Record<string, any> = {}) {
    return wrapRequest<{ stories: IStory[] }>(`stories/`, "get", params);
  },
  get(id: number, params: Record<string, any> = {}) {
    return wrapRequest<{ story: IStory }>(`stories/${id}`, "get", params);
  },
  async getBySlug(slug: string) {
    const slugParts = slug.split("/");
    const name = slugParts[slugParts.length - 1];
    const folder = slugParts.length > 1 ? slugParts.slice(0, -1).join("/") : "";

    const params: Record<string, any> = { per_page: 100 };
    if (folder) {
      params.starts_with = folder;
    }

    const response = await stories.getAll(params);
    const story = response.data.stories.find(
      (s) => s.slug === name || s.full_slug === slug,
    );

    if (!story) {
      throw new Error(`Story with slug "${slug}" not found`);
    }

    if (!story.id) {
      throw new Error(`Story with slug "${slug}" has no ID`);
    }

    return (await stories.get(story.id)).data.story;
  },
  create(story: IPendingStory, params: CreateStoryPayload = {}) {
    return wrapRequest<{ story: IStory }>(`stories/`, "post", {
      story,
      ...params,
    });
  },
  update(story: IStory, params: UpdateStoryPayload = {}) {
    return wrapRequest<{ story: IStory }>(`stories/${story.id}`, "put", {
      story,
      ...params,
    });
  },
  delete(storyOrId: IStory | number) {
    const path =
      typeof storyOrId === "number"
        ? `stories/${storyOrId}`
        : `stories/${storyOrId.id}`;

    return wrapRequest<{ story: IStory }>(path, "delete");
  },
};

/**
 * API methods for managing Storyblok components
 */
export const componentGroups = {
  getAll(params: Record<string, any> = {}) {
    return wrapRequest<{ component_groups: IComponentGroup[] }>(
      `component_groups/`,
      "get",
      params,
    );
  },
  get(id: number | string, params: Record<string, any> = {}) {
    return wrapRequest<{ component_group: IComponentGroup }>(
      `component_groups/${id}`,
      "get",
      params,
    );
  },
  create(componentGroup: IPendingComponentGroup) {
    return wrapRequest<{ component_group: IComponentGroup }>(
      `component_groups/`,
      "post",
      { component_group: componentGroup },
    );
  },
  update(componentGroup: IComponentGroup) {
    return wrapRequest<{ component_group: IComponentGroup }>(
      `component_groups/${componentGroup.id}`,
      "put",
      { component_group: componentGroup },
    );
  },
  delete(componentGroupOrId: IComponentGroup | number | string) {
    const path =
      typeof componentGroupOrId === "number" ||
      typeof componentGroupOrId === "string"
        ? `component_groups/${componentGroupOrId}`
        : `component_groups/${componentGroupOrId.id}`;

    return wrapRequest<{ component_group: IComponentGroup }>(path, "delete");
  },
};

export const components = {
  getAll(params: Record<string, any> = {}) {
    return wrapRequest<{ components: IComponent[] }>(
      `components/`,
      "get",
      params,
    );
  },
  get(id: number | string, params: Record<string, any> = {}) {
    return wrapRequest<{ component: IComponent }>(
      `components/${id}`,
      "get",
      params,
    );
  },
  create(component: IPendingComponent) {
    return wrapRequest<{ component: IComponent }>(`components/`, "post", {
      component,
    });
  },
  update(component: IComponent) {
    return wrapRequest<{ component: IComponent }>(
      `components/${component.id}`,
      "put",
      { component },
    );
  },
  delete(componentOrId: IComponent | number | string) {
    const path =
      typeof componentOrId === "number" || typeof componentOrId === "string"
        ? `components/${componentOrId}`
        : `components/${componentOrId.id}`;

    return wrapRequest<{ component: IComponent }>(path, "delete");
  },
};

/**
 * API methods for managing Storyblok spaces
 */
export const spaces = {
  async getSpaceOptions() {
    const config = await loadConfig();
    if (!config?.spaceId) {
      throw new Error("Space ID is not set");
    }

    const response = await wrapRequest<{ space: ISpace }>(
      `spaces/${config.spaceId}/`,
      "get",
    );

    return response?.data?.space?.options ?? ({} as ISpace["options"]);
  },

  async getSpaceLanguages() {
    const config = await loadConfig();
    if (!config?.spaceId) {
      throw new Error("Space ID is not set");
    }

    const response = await wrapRequest<{ space: ISpace }>(
      `spaces/${config.spaceId}/`,
      "get",
    );

    return (
      response?.data?.space?.languages ||
      response.data.space.options.languages ||
      []
    );
  },
};

/**
 * API methods for managing Storyblok datasources
 */
export const datasources = {
  getAll(params: Record<string, any> = {}) {
    return wrapRequest<{ datasources: IDataSource[] }>(
      `datasources/`,
      "get",
      params,
    );
  },
  get(id: number | string, params: Record<string, any> = {}) {
    return wrapRequest<{ datasource: IDataSource }>(
      `datasources/${id}`,
      "get",
      params,
    );
  },
  create(entry: IPendingDataSource) {
    return wrapRequest<{ datasource: IDataSource }>(`datasources/`, "post", {
      datasource: entry,
    });
  },
  update(entry: IDataSource) {
    return wrapRequest<{ datasource: IDataSource }>(
      `datasources/${entry.id}`,
      "put",
      {
        datasource: entry,
      },
    );
  },
  delete(entryOrId: IDataSource | number | string) {
    const path =
      typeof entryOrId === "number" || typeof entryOrId === "string"
        ? `datasources/${entryOrId}`
        : `datasources/${entryOrId.id}`;

    return wrapRequest<{ datasource: IStory }>(path, "delete");
  },
  async has(id: number | string) {
    const response = await datasources.getAll();
    return response.data.datasources.some((datasource) =>
      [datasource.slug, datasource.id].includes(id),
    );
  },
};

export const datasourceEntries = {
  getAll(
    datasource: IDataSource | number | string,
    params: Record<string, any> = {},
  ) {
    if (typeof datasource === "number") {
      params.datasource_id = datasource;
    } else if (typeof datasource === "string") {
      params.datasource_slug = datasource;
    } else {
      params.datasource_id = datasource.id;
    }

    return wrapRequest<{ datasource_entries: IDataSourceEntry[] }>(
      `datasource_entries/`,
      "get",
      params,
    );
  },
  get(id: number | string, params: Record<string, any> = {}) {
    return wrapRequest<{ datasource: IDataSourceEntry }>(
      `datasource_entries/${id}`,
      "get",
      params,
    );
  },
  create(entry: IPendingDataSourceEntry) {
    return wrapRequest<{ datasource: IDataSourceEntry }>(
      `datasource_entries/`,
      "post",
      {
        datasource_entry: entry,
      },
    );
  },
  update(entry: IDataSourceEntry) {
    return wrapRequest<{ datasource: IDataSourceEntry }>(
      `datasource_entries/${entry.id}`,
      "put",
      {
        entry,
      },
    );
  },
  delete(entryOrId: IDataSourceEntry | number | string) {
    const path =
      typeof entryOrId === "number" || typeof entryOrId === "string"
        ? `datasource_entries/${entryOrId}`
        : `datasource_entries/${entryOrId.id}`;

    return wrapRequest<{ datasource: IStory }>(path, "delete");
  },
};

export const api = {
  spaces,
  stories,
  componentGroups,
  components,
  datasources,
  datasourceEntries,
};
