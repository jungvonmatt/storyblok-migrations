import pc from "picocolors";
import { api, UpdateStoryPayload } from "../../utils/api";
import { RunMigrationOptions } from "../../utils/migration";
import { StoryMigration } from "../../types/migration";
import { cloneDeep } from "lodash";
import { createRollbackFile } from "../../utils/storyblok";

/**
 * Handles the update of an existing story based on the provided migration schema.
 * This function performs the following operations:
 * 1. Checks if the operation is a dry run
 * 2. Retrieves the story using either numeric ID or slug
 * 3. Stores original story data for rollback
 * 4. Applies updates to story properties and content
 * 5. Updates the story with optional publishing options
 * 6. Creates a rollback file for the changes
 * 7. Logs the update status
 *
 * @param {Object} migration - The migration object containing the story updates
 * @param {number | string} migration.id - The ID or slug of the story to update
 * @param {Partial<StoryMigration>} migration.story - The schema defining the story updates
 * @param {RunMigrationOptions} options - Configuration options for the migration
 * @param {boolean} [options.isDryrun] - Whether to perform a dry run without making actual changes
 * @throws {Error} If the story update fails or if the story is not found
 */
export const handleUpdateStory = async (
  migration: { id: number | string; story: Partial<StoryMigration> },
  options: RunMigrationOptions,
) => {
  console.log(`${pc.blue("-")} Updating story: ${migration.id}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not updating story`);
    console.log(migration);
    return;
  }

  try {
    // Get the story using either numeric ID or slug
    const story =
      typeof migration.id === "number"
        ? (await api.stories.get(migration.id)).data.story
        : await api.stories.getBySlug(migration.id);

    if (!story) {
      throw new Error(`Story "${migration.id}" not found`);
    }

    // Store original story data for rollback
    const originalStory = cloneDeep(story);

    // Apply updates
    if (migration.story.name) {
      story.name = migration.story.name;
    }
    if (migration.story.slug) {
      story.slug = migration.story.slug;
    }
    if (migration.story.parent_id !== undefined) {
      story.parent_id = migration.story.parent_id;
    }
    if (migration.story.content) {
      // For partial content updates, merge with existing content
      story.content = {
        ...story.content,
        ...migration.story.content,
        // Ensure component is always set
        component:
          migration.story.content.component ||
          story.content?.component ||
          "default",
      };
    }

    const payload: UpdateStoryPayload = {};

    if (migration.story.publish) {
      payload.publish = "1";
    }

    if (migration.story.release_id) {
      payload.release_id = migration.story.release_id;
    }

    if (migration.story.lang) {
      payload.lang = migration.story.lang;
    }

    // Update the story
    await api.stories.update(story, payload);

    // Create rollback data
    const rollbackData = [
      {
        id: originalStory.id,
        full_slug: originalStory.full_slug,
        content: originalStory.content,
        name: originalStory.name,
        slug: originalStory.slug,
        parent_id: originalStory.parent_id,
      },
    ];

    // Generate a unique identifier for this migration
    const migrationId =
      typeof migration.id === "string"
        ? migration.id.replace(/[^a-zA-Z0-9]/g, "_")
        : migration.id;

    // Create rollback file
    await createRollbackFile(rollbackData, `story_${migrationId}`, "update");

    console.log(
      `${pc.green("✓")} Story updated successfully: ${story.full_slug}`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to update story:`, error);
    throw error;
  }
};
