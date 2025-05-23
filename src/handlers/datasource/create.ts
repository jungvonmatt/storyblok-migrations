import pc from "picocolors";
import { addOrUpdateDatasource } from "../../utils/storyblok";
import { RunMigrationOptions } from "../../utils/migration";
import { DatasourceMigration } from "../../types/migration";
import { api } from "../../utils/api";
import { IPendingDataSourceEntry } from "../../types/IDataSource";

/**
 * Handles the creation of a new datasource based on the provided migration schema.
 * This function performs the following operations:
 * 1. Checks if the datasource already exists
 * 2. Creates a new datasource instance
 * 3. Adds entries to the datasource
 * 4. Logs the creation status
 *
 * @param {Object} migration - The migration object containing the datasource schema and entries
 * @param {DatasourceMigration} migration.datasource - The schema defining the datasource properties
 * @param {Omit<IPendingDataSourceEntry, "datasource_id">[]} [migration.entries] - Optional entries to add to the datasource
 * @param {RunMigrationOptions} options - Configuration options for the migration
 * @param {boolean} [options.isDryrun] - Whether to perform a dry run without making actual changes
 * @throws {Error} If the datasource creation fails
 */
export const handleCreateDatasource = async (
  migration: {
    datasource: DatasourceMigration;
    entries?: Omit<IPendingDataSourceEntry, "datasource_id">[];
  },
  options: RunMigrationOptions,
) => {
  console.log(
    `${pc.blue("-")} Creating datasource: ${migration.datasource.name}`,
  );

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not creating datasource`);
    console.log(migration.datasource);
    return;
  }

  try {
    // Check if datasource already exists
    const response = await api.datasources.getAll();
    const existingDatasources = response.data.datasources || [];
    const existingDatasource = existingDatasources.find(
      (d) =>
        d.name === migration.datasource.name ||
        d.slug === migration.datasource.slug,
    );

    if (existingDatasource) {
      console.log(
        `${pc.yellow("!")} Datasource already exists: ${existingDatasource.name}`,
      );
      return;
    }

    const entries = migration.entries || [];
    const [datasource, datasourceEntries] = await addOrUpdateDatasource(
      migration.datasource,
      entries.map((entry) => ({
        name: entry.name,
        value: entry.value,
        dimension_value: entry.dimension_value,
      })),
    );

    console.log(
      `${pc.green("✓")} Datasource created successfully: ${datasource.name}`,
    );
    console.log(`${pc.green("-")} Created ${datasourceEntries.length} entries`);
  } catch (error) {
    // Don't rethrow - let the calling function handle it
    console.error(`${pc.red("✗")} Failed to create datasource:`, error);
  }
};
