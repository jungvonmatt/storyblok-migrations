import pc from "picocolors";
import { api } from "../../utils/api";
import { ComponentGroupMigration } from "../../types/migration";
import { RunMigrationOptions } from "../../utils/migration";

export const handleCreateComponentGroup = async (
  migration: { groups: ComponentGroupMigration[] },
  options: RunMigrationOptions,
) => {
  console.log(`${pc.blue("-")} Creating component groups`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not creating component groups`);
    console.log(migration.groups);
    return;
  }

  try {
    const response = await api.componentGroups.getAll();
    const existingGroups = response.data.component_groups || [];

    for (const group of migration.groups) {
      if (!existingGroups.some((g) => g.name === group.name)) {
        console.log(`${pc.blue("-")} Creating group: ${group.name}`);

        try {
          const result = await api.componentGroups.create({
            name: group.name,
          });
          console.log(
            `${pc.green("✓")} Group created with ID: ${result.data?.component_group?.id}`,
          );
        } catch (e) {
          console.error(`${pc.red("✗")} Creation error details:`, e);
          throw e;
        }
      } else {
        console.log(`${pc.yellow("!")} Group already exists: ${group.name}`);
      }
    }

    console.log(`${pc.green("✓")} Component groups created successfully`);
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to create component groups:`, error);
    throw error;
  }
};
