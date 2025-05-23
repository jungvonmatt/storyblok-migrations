import pc from "picocolors";
import { api } from "../../utils/api";
import { ComponentMigration } from "../../types/migration";
import { helper, RunMigrationOptions } from "../../utils/migration";
import { cloneDeep } from "lodash";
import { createRollbackFile } from "../../utils/storyblok";

/**
 * Handles the update of an existing component based on the provided migration schema.
 * This function performs the following operations:
 * 1. Checks if the component exists before updating
 * 2. Updates the component schema fields and tabs if provided
 * 3. Updates other properties like display name, root status, and nestable status
 * 4. Associates the component with a component group if specified
 * 5. Saves the updated component to the API
 * 6. Creates a rollback file for the component
 *
 * @param {Object} migration - The migration object containing the component schema
 * @param {Partial<ComponentMigration>} migration.schema - The schema defining the component properties
 * @param {RunMigrationOptions} options - Configuration options for the migration
 * @param {boolean} [options.isDryrun] - Whether to perform a dry run without making actual changes
 * @throws {Error} If the component update fails
 */
export const handleUpdateComponent = async (
  migration: { schema: Partial<ComponentMigration> },
  options: RunMigrationOptions,
) => {
  console.log(`${pc.blue("-")} Updating component: ${migration.schema.name}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not updating component`);
    console.log(migration);
    return;
  }

  try {
    // Check if component exists before updating
    const response = await api.components.getAll();
    const existingComponents = response.data.components || [];
    const componentExists = existingComponents.some(
      (c) => c.name === migration.schema.name,
    );

    if (!componentExists) {
      console.error(
        `${pc.red("✗")} Component "${migration.schema.name}" not found. Cannot update a non-existent component.`,
      );
      throw new Error(`Component "${migration.schema.name}" not found`);
    }

    const component = await helper.updateComponent(migration.schema.name || "");

    // Store original component data for rollback
    const originalComponent = cloneDeep(component.instance);

    // Update fields if provided
    if (migration.schema?.schema) {
      component.addOrUpdateFields(
        migration.schema.schema,
        migration.schema.tabs
          ? {
              general: migration.schema.tabs.general || [],
              ...migration.schema.tabs,
            }
          : undefined,
      );
    }

    // Update other properties if provided
    if (migration.schema.display_name) {
      component.instance.display_name = migration.schema.display_name;
    }
    if (migration.schema.is_root !== undefined) {
      component.instance.is_root = migration.schema.is_root;
    }
    if (migration.schema.is_nestable !== undefined) {
      component.instance.is_nestable = migration.schema.is_nestable;
    }
    if (migration.schema.component_group_name) {
      // Get component groups to find the UUID
      const response = await api.componentGroups.getAll();
      const componentGroups = response.data.component_groups || [];
      const group = componentGroups.find(
        (g) => g.name === migration.schema.component_group_name,
      );
      if (group) {
        component.instance.component_group_uuid = group.uuid;
      } else {
        console.warn(
          `${pc.yellow("!")} Component group "${migration.schema.component_group_name}" not found`,
        );
      }
    }

    // Save the component
    await component.save();

    // Create rollback data
    const rollbackData = [
      {
        id: originalComponent.id,
        name: originalComponent.name,
        schema: originalComponent.schema,
        display_name: originalComponent.display_name,
        is_root: originalComponent.is_root,
        is_nestable: originalComponent.is_nestable,
        component_group_uuid: originalComponent.component_group_uuid,
      },
    ];

    // Create rollback file
    await createRollbackFile(
      rollbackData,
      `component_${migration.schema.name?.replace(/[^a-zA-Z0-9]/g, "_")}`,
      "update",
    );

    console.log(
      `${pc.green("✓")} Component updated successfully: ${migration.schema.name}`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to update component:`, error);
    throw error;
  }
};
