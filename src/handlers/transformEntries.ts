import pc from "picocolors";
import { helper } from "../utils/migration";
import { TransformEntriesMigration } from "../types/migration";
import { RunMigrationOptions } from "../utils/migration";

/**
 * Handles the transformation of entries for a specific component based on the provided migration schema.
 * This function performs the following operations:
 * 1. Validates the migration configuration
 * 2. Updates the component using the helper
 * 3. Transforms the entries with specified options
 * 4. Logs the transformation status
 *
 * @param {TransformEntriesMigration} migration - The migration object containing the transformation configuration
 * @param {string} migration.component - The name of the component to transform entries for
 * @param {Function} migration.transform - The transformation function to apply to entries
 * @param {boolean} [migration.publish] - Whether to publish the transformed entries
 * @param {string[]} [migration.languages] - Languages to publish the transformed entries in
 * @param {RunMigrationOptions} options - Configuration options for the migration
 * @param {boolean} [options.isDryrun] - Whether to perform a dry run without making actual changes
 * @param {boolean} [options.publish] - Default publish setting if not specified in migration
 * @param {string[]} [options.publishLanguages] - Default publish languages if not specified in migration
 * @throws {Error} If the transformation fails or if required configuration is missing
 */
export const handleTransformEntries = async (
  migration: TransformEntriesMigration,
  options: RunMigrationOptions,
) => {
  console.log(
    `${pc.blue("-")} Transforming entries for component: ${migration.component}`,
  );

  if (!migration.component || typeof migration.transform !== "function") {
    throw new Error(
      "Transform migration requires a component name and transform function",
    );
  }

  try {
    const component = await helper.updateComponent(migration.component);

    await component.transformEntries(migration.transform, {
      isDryrun: options.isDryrun,
      publish: migration.publish || options.publish,
      publishLanguages: migration.languages || options.publishLanguages,
    });

    console.log(
      `${pc.green("✓")} Entries transformed successfully for: ${migration.component}`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to transform entries:`, error);
    throw error;
  }
};
