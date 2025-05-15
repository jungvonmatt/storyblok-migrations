import pc from "picocolors";
import { api, UpdateStoryPayload } from "../../utils/api";
import { RunMigrationOptions } from "../../utils/migration";
import { StoryMigration } from "../../types/migration";
import { cloneDeep } from "lodash";
import { createRollbackFile } from "../../utils/storyblok";

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
