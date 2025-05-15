import pc from "picocolors";
import { api } from "../../utils/api";
import { ComponentGroupMigration } from "../../types/migration";
import { RunMigrationOptions } from "../../utils/migration";

export const handleUpdateComponentGroup = async (
  migration: { id: number | string; group: ComponentGroupMigration },
  options: RunMigrationOptions,
) => {
  console.log(`${pc.blue("-")} Updating component group: ${migration.id}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not updating component group`);
    console.log(migration.group);
    return;
  }

  try {
    const response = await api.componentGroups.getAll();
    const existingGroups = response.data.component_groups || [];

    // Find component group by ID or name
    const existingGroup = existingGroups.find(
      (g) =>
        g.id === migration.id ||
        (typeof migration.id === "string" && g.name === migration.id),
    );

    if (!existingGroup) {
      throw new Error(`Component group "${migration.id}" not found`);
    }

    if (!existingGroup.id || !existingGroup.uuid) {
      throw new Error(
        `Component group "${migration.id}" has missing required properties`,
      );
    }

    console.log(
      `${pc.blue("-")} Updating group: ${existingGroup.name} to ${migration.group.name}`,
    );

    await api.componentGroups.update({
      id: existingGroup.id,
      name: migration.group.name,
      uuid: existingGroup.uuid,
    });

    console.log(`${pc.green("✓")} Component group updated successfully`);
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to update component group:`, error);
    throw error;
  }
};
