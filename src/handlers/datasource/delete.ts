import pc from "picocolors";
import { api } from "../../utils/api";
import { RunMigrationOptions } from "../../utils/migration";

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
