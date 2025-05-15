import { api } from "../../utils/api";
import { RunMigrationOptions } from "../../utils/migration";
import pc from "picocolors";

export const handleDeleteComponentGroup = async (
  migration: { id: number | string },
  options: RunMigrationOptions,
) => {
  console.log(`${pc.blue("-")} Deleting component group: ${migration.id}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not deleting component group`);
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

    if (!existingGroup.id) {
      throw new Error(`Component group "${migration.id}" has no ID`);
    }

    console.log(`${pc.blue("-")} Deleting group: ${existingGroup.name}`);

    await api.componentGroups.delete(existingGroup.id);

    console.log(`${pc.green("✓")} Component group deleted successfully`);
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to delete component group:`, error);
    throw error;
  }
};
