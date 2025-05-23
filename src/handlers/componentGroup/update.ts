import pc from "picocolors";
import { api } from "../../utils/api";
import { ComponentGroupMigration } from "../../types/migration";
import { RunMigrationOptions } from "../../utils/migration";

/**
 * Handles the update of an existing component group based on the provided migration schema.
 * This function performs the following operations:
 * 1. Checks if the operation is a dry run
 * 2. Retrieves existing component groups
 * 3. Updates the specified component group
 * 4. Logs the update status
 *
 * @param {Object} migration - The migration object containing the component group ID and new name
 * @param {number | string} migration.id - The ID of the component group to update
 * @param {ComponentGroupMigration} migration.group - The new component group definition
 * @param {RunMigrationOptions} options - Configuration options for the migration
 * @param {boolean} [options.isDryrun] - Whether to perform a dry run without making actual changes
 * @throws {Error} If the component group update fails
 */
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
