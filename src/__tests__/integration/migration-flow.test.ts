import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { api } from "../../utils/api";
import { handleCreateComponent, handleDeleteComponent } from "../../handlers";
import type { IComponent } from "../../types/IComponent";

// Mock only the external API calls
vi.mock("../../utils/api", () => ({
  api: {
    components: {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    componentGroups: {
      getAll: vi.fn(),
    },
  },
}));

// Simple integration test suite that verifies
// the communication between the actual handlers and the API
describe("Integration Tests: Migration Handlers", () => {
  const mockComponent: IComponent = {
    name: "test-component",
    display_name: "Test Component",
    schema: {
      title: { type: "text", display_name: "Title", required: true },
    },
    created_at: "2024-01-01T00:00:00.000Z",
    id: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock API responses with correct structure
    (api.components.getAll as Mock).mockResolvedValue({
      data: { components: [] },
    });
    (api.components.create as Mock).mockResolvedValue({
      data: { component: mockComponent },
    });
    (api.components.update as Mock).mockResolvedValue({
      data: { component: mockComponent },
    });
    (api.components.delete as Mock).mockResolvedValue({
      data: {},
    });
    (api.componentGroups.getAll as Mock).mockResolvedValue({
      data: { component_groups: [] },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should handle component creation flow", async () => {
    // Call the handler directly
    await handleCreateComponent(
      {
        schema: {
          name: "test-component",
          display_name: "Test Component",
          schema: {
            title: { type: "text", display_name: "Title", required: true },
          },
        },
      },
      { isDryrun: false },
    );

    // Verify API was called correctly
    expect(api.components.create).toHaveBeenCalled();
    expect(api.components.update).toHaveBeenCalled();
  });

  it("should handle component deletion flow", async () => {
    // Mock the component lookup
    (api.components.getAll as Mock).mockResolvedValue({
      data: {
        components: [{ id: 123, name: "delete-component" }],
      },
    });

    // Call the handler directly
    await handleDeleteComponent(
      { name: "delete-component" },
      { isDryrun: false },
    );

    // Verify API was called correctly
    expect(api.components.delete).toHaveBeenCalled();
  });

  it("should handle API errors gracefully", async () => {
    // Mock API to throw an error
    (api.components.create as Mock).mockRejectedValue(new Error("API Error"));

    // Call handler and expect error
    await expect(
      handleCreateComponent(
        {
          schema: {
            name: "error-test",
            display_name: "Error Test",
            schema: {
              title: { type: "text", display_name: "Title", required: true },
            },
          },
        },
        { isDryrun: false },
      ),
    ).rejects.toThrow("API Error");
  });
});
