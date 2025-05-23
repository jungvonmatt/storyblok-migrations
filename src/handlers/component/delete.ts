import pc from "picocolors";
import { api } from "../../utils/api";
import { RunMigrationOptions } from "../../utils/migration";

/**
 * Handles the deletion of a component based on the provided migration schema.
 * This function performs the following operations:
 * 1. Checks if the component exists
 * 2. Deletes the component from the API
 *
 * @param {Object} migration - The migration object containing the component name
 * @param {string | number} migration.name - The name or ID of the component to delete
 * @param {RunMigrationOptions} options - Configuration options for the migration
 * @param {boolean} [options.isDryrun] - Whether to perform a dry run without making actual changes
 * @throws {Error} If the component deletion fails
 */
export const handleDeleteComponent = async (
  migration: { name: string | number },
  options: RunMigrationOptions,
) => {
  console.log(`${pc.blue("-")} Deleting component: ${migration.name}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not deleting component`);
    return;
  }

  try {
    // First get all components to find the one we want to delete
    const response = await api.components.getAll();
    const existingComponents = response.data.components || [];
    const componentToDelete = existingComponents.find(
      (c) => c.name === migration.name || c.id === migration.name,
    );

    if (!componentToDelete) {
      throw new Error(`Component "${migration.name}" not found`);
    }

    await api.components.delete(componentToDelete.id);
    console.log(
      `${pc.green("✓")} Component deleted successfully: ${migration.name}`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to delete component:`, error);
    throw error;
  }
};
