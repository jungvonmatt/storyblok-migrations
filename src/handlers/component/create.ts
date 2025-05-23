import pc from "picocolors";
import { api } from "../../utils/api";
import { ComponentMigration } from "../../types/migration";
import { Component, RunMigrationOptions } from "../../utils/migration";

/**
 * Handles the creation of a new component based on the provided migration schema.
 * This function performs the following operations:
 * 1. Checks if the component already exists
 * 2. Creates a new component instance
 * 3. Sets additional properties like display name, root status, and nestable status
 * 4. Associates the component with a component group if specified
 * 5. Adds schema fields and tabs if provided
 * 6. Saves the component to the API
 *
 * @param {Object} migration - The migration object containing the component schema
 * @param {ComponentMigration} migration.schema - The schema defining the component properties
 * @param {RunMigrationOptions} options - Configuration options for the migration
 * @param {boolean} [options.isDryrun] - Whether to perform a dry run without making actual changes
 *
 * @throws {Error} If the component creation fails
 */
export const handleCreateComponent = async (
  migration: { schema: ComponentMigration },
  options: RunMigrationOptions,
) => {
  console.log(`${pc.blue("-")} Creating component: ${migration.schema.name}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not creating component`);
    console.log(migration.schema);
    return;
  }

  try {
    const response = await api.components.getAll();
    const existingComponents = response.data.components || [];
    const existingComponent = existingComponents.find(
      (c) => c.name === migration.schema.name,
    );

    if (existingComponent) {
      console.log(
        `${pc.yellow("!")} Component already exists: ${migration.schema.name}`,
      );
      return;
    }

    const component = new Component();
    await component.create(migration.schema.name);

    // Set additional properties
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

    // Add schema fields
    if (migration.schema.schema) {
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

    // Save the component
    await component.save();
    console.log(
      `${pc.green("✓")} Component created successfully: ${migration.schema.name}`,
    );
  } catch (error) {
    console.error(
      `${pc.red("✗")} Failed to create component: ${migration.schema.name}`,
      error,
    );
    throw error;
  }
};
