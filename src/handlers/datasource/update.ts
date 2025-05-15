import pc from "picocolors";
import { IPendingDataSourceEntry } from "../../types/IDataSource";
import { DatasourceMigration } from "../../types/migration";
import { api } from "../../utils/api";
import { RunMigrationOptions } from "../../utils/migration";
import { cloneDeep } from "lodash";
import { addOrUpdateDatasource } from "../../utils/storyblok";
import { createRollbackFile } from "../../utils/storyblok";
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
