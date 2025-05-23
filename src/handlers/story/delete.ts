import pc from "picocolors";
import { api } from "../../utils/api";
import { RunMigrationOptions } from "../../utils/migration";

/**
 * Handles the deletion of a story based on the provided migration schema.
 * This function performs the following operations:
 * 1. Checks if the operation is a dry run
 * 2. Retrieves the story using either numeric ID or slug
 * 3. Verifies the story exists and has a valid ID
 * 4. Deletes the story from the API
 * 5. Logs the deletion status
 *
 * @param {Object} migration - The migration object containing the story ID
 * @param {number | string} migration.id - The ID or slug of the story to delete
 * @param {RunMigrationOptions} options - Configuration options for the migration
 * @param {boolean} [options.isDryrun] - Whether to perform a dry run without making actual changes
 * @throws {Error} If the story deletion fails or if the story is not found
 */
export const handleDeleteStory = async (
  migration: { id: number | string },
  options: RunMigrationOptions,
) => {
  console.log(`${pc.blue("-")} Deleting story: ${migration.id}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not deleting story`);
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

    if (!story.id) {
      throw new Error(`Story "${migration.id}" has no ID`);
    }

    console.log(
      `${pc.blue("-")} Deleting story: ${story.name} (${story.full_slug})`,
    );

    await api.stories.delete(story.id);
    console.log(
      `${pc.green("✓")} Story deleted successfully: ${story.full_slug}`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to delete story:`, error);
    throw error;
  }
};
