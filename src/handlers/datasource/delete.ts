import pc from "picocolors";
import { api } from "../../utils/api";
import { RunMigrationOptions } from "../../utils/migration";

/**
 * Handles the deletion of a datasource based on the provided migration schema.
 * This function performs the following operations:
 * 1. Checks if the operation is a dry run
 * 2. Verifies the datasource exists
 * 3. Deletes the datasource from the API
 * 4. Logs the deletion status
 *
 * @param {Object} migration - The migration object containing the datasource ID
 * @param {number | string} migration.id - The ID of the datasource to delete
 * @param {RunMigrationOptions} options - Configuration options for the migration
 * @param {boolean} [options.isDryrun] - Whether to perform a dry run without making actual changes
 * @throws {Error} If the datasource deletion fails
 */
export const handleDeleteDatasource = async (
  migration: { id: number | string },
  options: RunMigrationOptions,
) => {
  console.log(`${pc.blue("-")} Deleting datasource: ${migration.id}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not deleting datasource`);
    return;
  }

  try {
    // First verify the datasource exists
    const response = await api.datasources.get(migration.id);
    const datasource = response.data.datasource;

    if (!datasource) {
      throw new Error(`Datasource with ID "${migration.id}" not found`);
    }

    console.log(`${pc.blue("-")} Deleting datasource: ${datasource.name}`);

    await api.datasources.delete(migration.id);
    console.log(
      `${pc.green("✓")} Datasource deleted successfully: ${datasource.name}`,
    );
  } catch (error) {
    // Don't rethrow - let the calling function handle it
    console.error(`${pc.red("✗")} Failed to delete datasource:`, error);
  }
};
