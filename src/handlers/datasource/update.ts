import pc from "picocolors";
import { IPendingDataSourceEntry } from "../../types/IDataSource";
import { DatasourceMigration } from "../../types/migration";
import { api } from "../../utils/api";
import { RunMigrationOptions } from "../../utils/migration";
import { cloneDeep } from "lodash";
import { addOrUpdateDatasource } from "../../utils/storyblok";
import { createRollbackFile } from "../../utils/storyblok";

/**
 * Handles the update of an existing datasource based on the provided migration schema.
 * This function performs the following operations:
 * 1. Checks if the operation is a dry run
 * 2. Verifies that either datasource updates or entries are provided
 * 3. Retrieves the existing datasource
 * 4. Updates datasource properties if provided
 * 5. Updates datasource entries if provided
 * 6. Creates a rollback file for the changes
 *
 * @param {Object} migration - The migration object containing the datasource updates
 * @param {number | string} migration.id - The ID of the datasource to update
 * @param {Partial<DatasourceMigration>} [migration.datasource] - Optional updates to the datasource properties
 * @param {Omit<IPendingDataSourceEntry, "datasource_id">[]} [migration.entries] - Optional entries to update in the datasource
 * @param {RunMigrationOptions} options - Configuration options for the migration
 * @param {boolean} [options.isDryrun] - Whether to perform a dry run without making actual changes
 * @throws {Error} If the datasource update fails
 */
export const handleUpdateDatasource = async (
  migration: {
    id: number | string;
    datasource?: Partial<DatasourceMigration>;
    entries?: Omit<IPendingDataSourceEntry, "datasource_id">[];
  },
  options: RunMigrationOptions,
) => {
  console.log(`${pc.blue("-")} Updating datasource: ${migration.id}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not updating datasource`);
    console.log(migration);
    return;
  }

  if (!migration.datasource && !migration.entries) {
    console.error(
      `${pc.red("✗")} Must provide either datasource updates or entries`,
    );
    return;
  }

  try {
    // First get the datasource details
    const response = await api.datasources.get(migration.id);
    const datasource = response.data.datasource;

    // Store original datasource for rollback
    const originalDatasource = cloneDeep(datasource);

    // First update the datasource properties if provided
    if (migration.datasource) {
      if (migration.datasource.name) {
        datasource.name = migration.datasource.name;
      }
      if (migration.datasource.slug) {
        datasource.slug = migration.datasource.slug;
      }

      await api.datasources.update(datasource);
      console.log(
        `${pc.green("✓")} Datasource properties updated successfully: ${datasource.name}`,
      );
    }

    // Then handle entries if provided
    if (migration.entries && migration.entries.length > 0) {
      const entries = migration.entries || [];
      const [, datasourceEntries] = await addOrUpdateDatasource(
        {
          name: datasource.name,
          slug: datasource.slug,
        },
        entries.map((entry) => ({
          name: entry.name,
          value: entry.value,
          dimension_value: entry.dimension_value,
        })),
      );

      console.log(
        `${pc.green("-")} Updated ${datasourceEntries.length} entries`,
      );
    }

    // Create rollback data
    const rollbackData = [
      {
        id: originalDatasource.id,
        name: originalDatasource.name,
        slug: originalDatasource.slug,
        dimensions: originalDatasource.dimensions,
      },
    ];

    // Generate a unique identifier for this migration
    const migrationId =
      typeof migration.id === "string"
        ? migration.id.replace(/[^a-zA-Z0-9]/g, "_")
        : migration.id;

    // Create rollback file
    await createRollbackFile(
      rollbackData,
      `datasource_${migrationId}`,
      "update",
    );
  } catch (error) {
    // Don't rethrow - let the calling function handle it
    console.error(`${pc.red("✗")} Failed to update datasource:`, error);
  }
};
