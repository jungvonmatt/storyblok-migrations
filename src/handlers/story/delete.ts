import pc from "picocolors";
import { api } from "../../utils/api";
import { RunMigrationOptions } from "../../utils/migration";

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
