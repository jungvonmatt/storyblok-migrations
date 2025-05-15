import pc from "picocolors";
import { addOrUpdateDatasource } from "../../utils/storyblok";
import { RunMigrationOptions } from "../../utils/migration";
import { DatasourceMigration } from "../../types/migration";
import { api } from "../../utils/api";
import { IPendingDataSourceEntry } from "../../types/IDataSource";

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
