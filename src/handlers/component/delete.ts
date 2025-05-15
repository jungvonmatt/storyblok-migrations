import pc from "picocolors";
import { api } from "../../utils/api";
import { RunMigrationOptions } from "../../utils/migration";

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
