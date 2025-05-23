import { api } from "../../utils/api";
import { RunMigrationOptions } from "../../utils/migration";
import pc from "picocolors";

/**
 * Handles the deletion of a component group based on the provided migration schema.
 * This function performs the following operations:
 * 1. Checks if the operation is a dry run
 * 2. Retrieves existing component groups
 * 3. Deletes the specified component group
 * 4. Logs the deletion status
 *
 * @param {Object} migration - The migration object containing the component group ID
 * @param {number | string} migration.id - The ID of the component group to delete
 * @param {RunMigrationOptions} options - Configuration options for the migration
 * @param {boolean} [options.isDryrun] - Whether to perform a dry run without making actual changes
 * @throws {Error} If the component group deletion fails
 */
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
