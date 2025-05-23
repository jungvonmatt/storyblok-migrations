import pc from "picocolors";
import { api, CreateStoryPayload } from "../../utils/api";
import { RunMigrationOptions } from "../../utils/migration";
import { StoryMigration } from "../../types/migration";

/**
 * Handles the creation of a new story based on the provided migration schema.
 * This function performs the following operations:
 * 1. Checks if the operation is a dry run
 * 2. Generates a slug for the story
 * 3. Verifies the story doesn't already exist
 * 4. Creates the story with the specified content and options
 * 5. Logs the creation status
 *
 * @param {Object} migration - The migration object containing the story schema
 * @param {StoryMigration} migration.story - The schema defining the story properties
 * @param {RunMigrationOptions} options - Configuration options for the migration
 * @param {boolean} [options.isDryrun] - Whether to perform a dry run without making actual changes
 * @throws {Error} If the story creation fails
 */
export const handleCreateStory = async (
  migration: { story: StoryMigration },
  options: RunMigrationOptions,
) => {
  console.log(`${pc.blue("-")} Creating story: ${migration.story.name}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not creating story`);
    console.log(migration.story);
    return;
  }

  try {
    // Generate the slug to check for existing stories
    const slug =
      migration.story.slug ||
      migration.story.name.toLowerCase().replace(/\s+/g, "-");

    // Check if story already exists
    const response = await api.stories.getAll({
      starts_with: slug,
    });
    const existingStories = response.data.stories || [];
    const existingStory = existingStories.find(
      (s) => s.slug === slug || s.name === migration.story.name,
    );

    if (existingStory) {
      console.log(
        `${pc.yellow("!")} Story already exists: ${existingStory.full_slug}`,
      );
      return;
    }

    const payload: CreateStoryPayload = {};

    if (migration.story.publish) {
      payload.publish = "1";
    }

    if (migration.story.release_id) {
      payload.release_id = migration.story.release_id;
    }

    const createResponse = await api.stories.create(
      {
        name: migration.story.name,
        slug,
        parent_id: migration.story.parent_id,
        content: {
          ...migration.story.content,
          component: migration.story.content.component || "default",
        },
      },
      payload,
    );

    console.log(
      `${pc.green("✓")} Story created successfully: ${createResponse.data.story.full_slug}`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to create story:`, error);
    throw error;
  }
};
