/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import pc from "picocolors";
import { Component, helper, RunMigrationOptions } from "../utils/migration";
import { api, UpdateStoryPayload, CreateStoryPayload } from "../utils/api";
import { addOrUpdateDatasource } from "../utils/storyblok";
import {
  ComponentGroupMigration,
  ComponentMigration,
  DatasourceMigration,
  Migration,
  RunOptions,
  StoryMigration,
  TransformEntriesMigration,
} from "../types/migration";
import { MigrationType } from "../types/migration";
import { cloneDeep } from "lodash";
import { createRollbackFile } from "../utils/storyblok";
import { IPendingDataSourceEntry } from "../types/IDataSource";

// TODO: Make it possible to use ESM syntax in the migration files
// TODO: Make it possible to use different file extensions for the migration files (e.g. .js, .ts, .yaml, etc.)

/**
 * Define a type-safe migration object for Storyblok schema changes.
 * This helper function provides compile-time type checking for different migration types.
 *
 * @param migration A strongly-typed migration object that must match one of the following types:
 *                 - ComponentGroupMigration (create/update/delete component groups)
 *                 - ComponentMigration (create/update/delete components)
 *                 - DatasourceMigration (create/update datasources)
 *                 - DatasourceEntryMigration (create/update datasource entries)
 *                 - StoryMigration (create/update stories)
 *                 - TransformEntriesMigration (bulk transform content entries)
 *
 * @returns The provided migration object without any transformation
 * @example
 * ```ts
 * const migration = defineMigration({
 *   type: 'create-component',
 *   name: 'my-component',
 *   component: {
 *     name: 'My Component',
 *     // ... component definition
 *   }
 * });
 * ```
 */
export function defineMigration<T extends MigrationType>(
  migration: Extract<Migration, { type: T }>,
): Extract<Migration, { type: T }> {
  return migration;
}

export async function run(filePath: string, options: RunOptions = {}) {
  try {
    // Resolve and load the migration file
    const resolvedPath = path.resolve(process.cwd(), filePath);
    console.log(`${pc.blue("-")} Loading migration from ${resolvedPath}`);

    if (!fs.existsSync(resolvedPath)) {
      console.error(`${pc.red("✗")} Migration file not found: ${resolvedPath}`);
      process.exit(1);
    }

    const migrationModule = await import(resolvedPath);
    const migration = migrationModule.default || migrationModule;

    // Common options for all migration types
    const migrationOptions: RunMigrationOptions = {
      isDryrun: options.dryRun,
      publish: options.publish,
      publishLanguages: options.languages,
    };

    switch (migration.type) {
      case "create-component-group":
        await handleCreateComponentGroup(migration, migrationOptions);
        break;
      case "update-component-group":
        await handleUpdateComponentGroup(migration, migrationOptions);
        break;
      case "delete-component-group":
        await handleDeleteComponentGroup(migration, migrationOptions);
        break;
      case "create-component":
        await handleCreateComponent(migration, migrationOptions);
        break;
      case "update-component":
        await handleUpdateComponent(migration, migrationOptions);
        break;
      case "delete-component":
        await handleDeleteComponent(migration, migrationOptions);
        break;
      case "create-story":
        await handleCreateStory(migration, migrationOptions);
        break;
      case "update-story":
        await handleUpdateStory(migration, migrationOptions);
        break;
      case "delete-story":
        await handleDeleteStory(migration, migrationOptions);
        break;
      case "create-datasource":
        await handleCreateDatasource(migration, migrationOptions);
        break;
      case "update-datasource":
        await handleUpdateDatasource(migration, migrationOptions);
        break;
      case "delete-datasource":
        await handleDeleteDatasource(migration, migrationOptions);
        break;
      /*       case "create-datasource-entry":
        await handleCreateDatasourceEntry(migration, migrationOptions);
        break;
      case "update-datasource-entry":
        await handleUpdateDatasourceEntry(migration, migrationOptions);
        break;
      case "delete-datasource-entry":
        await handleDeleteDatasourceEntry(migration, migrationOptions);
        break; */
      case "transform-entries":
        await handleTransformEntries(migration, migrationOptions);
        break;
      default:
        throw new Error(`Unknown migration type: ${(migration as any).type}`);
    }
  } catch (error) {
    console.error(`${pc.red("✗")} Migration failed:`, error);
    process.exit(1);
  }
}

// TODO: move helper functions to a separate file
async function handleCreateComponentGroup(
  migration: { groups: ComponentGroupMigration[] },
  options: RunMigrationOptions,
) {
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
}

async function handleUpdateComponentGroup(
  migration: { id: number | string; group: ComponentGroupMigration },
  options: RunMigrationOptions,
) {
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
}

async function handleDeleteComponentGroup(
  migration: { id: number | string },
  options: RunMigrationOptions,
) {
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
}

async function handleCreateComponent(
  migration: { schema: ComponentMigration },
  options: RunMigrationOptions,
) {
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
}

async function handleUpdateComponent(
  migration: { name: string } & Partial<ComponentMigration>,
  options: RunMigrationOptions,
) {
  console.log(`${pc.blue("-")} Updating component: ${migration.name}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not updating component`);
    console.log(migration);
    return;
  }

  try {
    const component = await helper.updateComponent(migration.name);

    // Store original component data for rollback
    const originalComponent = cloneDeep(component.instance);

    // Update fields if provided
    if (migration.schema) {
      component.addOrUpdateFields(
        migration.schema,
        migration.tabs
          ? {
              general: migration.tabs.general || [],
              ...migration.tabs,
            }
          : undefined,
      );
    }

    // Update other properties if provided
    if (migration.display_name) {
      component.instance.display_name = migration.display_name;
    }
    if (migration.is_root !== undefined) {
      component.instance.is_root = migration.is_root;
    }
    if (migration.is_nestable !== undefined) {
      component.instance.is_nestable = migration.is_nestable;
    }
    if (migration.component_group_name) {
      // Get component groups to find the UUID
      const response = await api.componentGroups.getAll();
      const componentGroups = response.data.component_groups || [];
      const group = componentGroups.find(
        (g) => g.name === migration.component_group_name,
      );
      if (group) {
        component.instance.component_group_uuid = group.uuid;
      } else {
        console.warn(
          `${pc.yellow("!")} Component group "${migration.component_group_name}" not found`,
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
      `component_${migration.name.replace(/[^a-zA-Z0-9]/g, "_")}`,
      "update",
    );

    console.log(
      `${pc.green("✓")} Component updated successfully: ${migration.name}`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to update component:`, error);
    throw error;
  }
}

async function handleDeleteComponent(
  migration: { name: string | number },
  options: RunMigrationOptions,
) {
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
}

async function handleCreateStory(
  migration: { story: StoryMigration },
  options: RunMigrationOptions,
) {
  console.log(`${pc.blue("-")} Creating story: ${migration.story.name}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not creating story`);
    console.log(migration.story);
    return;
  }

  try {
    // Generate the slug to check for existing stories
    const slug =
      migration.story.slug ||
      migration.story.name.toLowerCase().replace(/\s+/g, "-");

    // Check if story already exists
    const response = await api.stories.getAll({
      starts_with: slug,
    });
    const existingStories = response.data.stories || [];
    const existingStory = existingStories.find(
      (s) => s.slug === slug || s.name === migration.story.name,
    );

    if (existingStory) {
      console.log(
        `${pc.yellow("!")} Story already exists: ${existingStory.full_slug}`,
      );
      return;
    }

    const payload: CreateStoryPayload = {};

    if (migration.story.publish) {
      payload.publish = "1";
    }

    if (migration.story.release_id) {
      payload.release_id = migration.story.release_id;
    }

    const createResponse = await api.stories.create(
      {
        name: migration.story.name,
        slug,
        parent_id: migration.story.parent_id,
        content: {
          ...migration.story.content,
          component: migration.story.content.component || "default",
        },
      },
      payload,
    );

    console.log(
      `${pc.green("✓")} Story created successfully: ${createResponse.data.story.full_slug}`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to create story:`, error);
    throw error;
  }
}

async function handleUpdateStory(
  migration: { id: number | string; story: Partial<StoryMigration> },
  options: RunMigrationOptions,
) {
  console.log(`${pc.blue("-")} Updating story: ${migration.id}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not updating story`);
    console.log(migration);
    return;
  }

  try {
    // Get the story using either numeric ID or slug
    const story =
      typeof migration.id === "number"
        ? (await api.stories.get(migration.id)).data.story
        : await api.stories.getBySlug(migration.id);

    if (!story) {
      throw new Error(`Story "${migration.id}" not found`);
    }

    // Store original story data for rollback
    const originalStory = cloneDeep(story);

    // Apply updates
    if (migration.story.name) {
      story.name = migration.story.name;
    }
    if (migration.story.slug) {
      story.slug = migration.story.slug;
    }
    if (migration.story.parent_id !== undefined) {
      story.parent_id = migration.story.parent_id;
    }
    if (migration.story.content) {
      // For partial content updates, merge with existing content
      story.content = {
        ...story.content,
        ...migration.story.content,
        // Ensure component is always set
        component:
          migration.story.content.component ||
          story.content?.component ||
          "default",
      };
    }

    const payload: UpdateStoryPayload = {};

    if (migration.story.publish) {
      payload.publish = "1";
    }

    if (migration.story.release_id) {
      payload.release_id = migration.story.release_id;
    }

    if (migration.story.lang) {
      payload.lang = migration.story.lang;
    }

    // Update the story
    await api.stories.update(story, payload);

    // Create rollback data
    const rollbackData = [
      {
        id: originalStory.id,
        full_slug: originalStory.full_slug,
        content: originalStory.content,
        name: originalStory.name,
        slug: originalStory.slug,
        parent_id: originalStory.parent_id,
      },
    ];

    // Generate a unique identifier for this migration
    const migrationId =
      typeof migration.id === "string"
        ? migration.id.replace(/[^a-zA-Z0-9]/g, "_")
        : migration.id;

    // Create rollback file
    await createRollbackFile(rollbackData, `story_${migrationId}`, "update");

    console.log(
      `${pc.green("✓")} Story updated successfully: ${story.full_slug}`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to update story:`, error);
    throw error;
  }
}

async function handleDeleteStory(
  migration: { id: number | string },
  options: RunMigrationOptions,
) {
  console.log(`${pc.blue("-")} Deleting story: ${migration.id}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not deleting story`);
    return;
  }

  try {
    // Get the story using either numeric ID or slug
    const story =
      typeof migration.id === "number"
        ? (await api.stories.get(migration.id)).data.story
        : await api.stories.getBySlug(migration.id);

    if (!story) {
      throw new Error(`Story "${migration.id}" not found`);
    }

    if (!story.id) {
      throw new Error(`Story "${migration.id}" has no ID`);
    }

    console.log(
      `${pc.blue("-")} Deleting story: ${story.name} (${story.full_slug})`,
    );

    await api.stories.delete(story.id);
    console.log(
      `${pc.green("✓")} Story deleted successfully: ${story.full_slug}`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to delete story:`, error);
    throw error;
  }
}

async function handleCreateDatasource(
  migration: {
    datasource: DatasourceMigration;
    entries?: Omit<IPendingDataSourceEntry, "datasource_id">[];
  },
  options: RunMigrationOptions,
) {
  console.log(
    `${pc.blue("-")} Creating datasource: ${migration.datasource.name}`,
  );

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not creating datasource`);
    console.log(migration.datasource);
    return;
  }

  try {
    // Check if datasource already exists
    const response = await api.datasources.getAll();
    const existingDatasources = response.data.datasources || [];
    const existingDatasource = existingDatasources.find(
      (d) =>
        d.name === migration.datasource.name ||
        d.slug === migration.datasource.slug,
    );

    if (existingDatasource) {
      console.log(
        `${pc.yellow("!")} Datasource already exists: ${existingDatasource.name}`,
      );
      return;
    }

    const entries = migration.entries || [];
    const [datasource, datasourceEntries] = await addOrUpdateDatasource(
      migration.datasource,
      entries.map((entry) => ({
        name: entry.name,
        value: entry.value,
        dimension_value: entry.dimension_value,
      })),
    );

    console.log(
      `${pc.green("✓")} Datasource created successfully: ${datasource.name}`,
    );
    console.log(`${pc.green("-")} Created ${datasourceEntries.length} entries`);
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to create datasource:`, error);
    throw error;
  }
}

async function handleUpdateDatasource(
  migration: {
    id: number | string;
    datasource?: Partial<DatasourceMigration>;
    entries?: Omit<IPendingDataSourceEntry, "datasource_id">[];
  },
  options: RunMigrationOptions,
) {
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
    console.error(`${pc.red("✗")} Failed to update datasource:`, error);
    throw error;
  }
}

async function handleDeleteDatasource(
  migration: { id: number | string },
  options: RunMigrationOptions,
) {
  console.log(`${pc.blue("-")} Deleting datasource: ${migration.id}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not deleting datasource`);
    return;
  }

  try {
    // First verify the datasource exists
    const response = await api.datasources.get(migration.id);
    const datasource = response.data.datasource;

    if (!datasource) {
      throw new Error(`Datasource with ID "${migration.id}" not found`);
    }

    console.log(`${pc.blue("-")} Deleting datasource: ${datasource.name}`);

    await api.datasources.delete(migration.id);
    console.log(
      `${pc.green("✓")} Datasource deleted successfully: ${datasource.name}`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to delete datasource:`, error);
    throw error;
  }
}

// TODO: Evaluate if we need to handle create, update and delete of datasource entries
// We can handle create, update and delete of datasource entries in the handleCreateDatasource and handleUpdateDatasource functions already.

/* async function handleCreateDatasourceEntry(
  migration: { entry: DatasourceEntryMigration },
  options: RunMigrationOptions,
) {
  console.log(
    `${pc.blue("-")} Creating datasource entry: ${migration.entry.name}`,
  );

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not creating datasource entry`);
    console.log(migration.entry);
    return;
  }

  try {
    // If datasource_id is a string (slug), get the numeric ID first
    let datasourceId = migration.entry.datasource_id;
    let datasourceName = "";

    if (typeof datasourceId === "string") {
      const response = await api.datasources.getAll();
      const datasource = response.data.datasources.find(
        (d) => d.slug === datasourceId || d.name === datasourceId,
      );

      if (!datasource) {
        throw new Error(`Datasource "${datasourceId}" not found`);
      }

      datasourceId = datasource.id;
      datasourceName = datasource.name;
    } else {
      // If we got a numeric ID, get the datasource name for logging
      const response = await api.datasources.get(datasourceId);
      datasourceName = response.data.datasource?.name || `ID: ${datasourceId}`;
    }

    await api.datasourceEntries.create({
      datasource_id: datasourceId,
      name: migration.entry.name,
      value: migration.entry.value,
      dimension_value: migration.entry.dimension_value,
    });

    console.log(
      `${pc.green("✓")} Datasource entry "${migration.entry.name}" created successfully in datasource "${datasourceName}"`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to create datasource entry:`, error);
    throw error;
  }
}

async function handleUpdateDatasourceEntry(
  migration: { id: number; entry: Partial<DatasourceEntryMigration> },
  options: RunMigrationOptions,
) {
  console.log(`${pc.blue("-")} Updating datasource entry: ${migration.id}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not updating datasource entry`);
    console.log(migration);
    return;
  }

  try {
    const response = await api.datasourceEntries.get(migration.id);
    const entry = response.data.datasource;

    // Apply updates
    if (migration.entry.name) {
      entry.name = migration.entry.name;
    }
    if (migration.entry.value) {
      entry.value = migration.entry.value;
    }
    if (migration.entry.dimension_value) {
      entry.dimension_value = migration.entry.dimension_value;
    }

    await api.datasourceEntries.update(entry);
    console.log(
      `${pc.green("✓")} Datasource entry updated successfully: ${entry.name}`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to update datasource entry:`, error);
    throw error;
  }
}

async function handleDeleteDatasourceEntry(
  migration: { id: number },
  options: RunMigrationOptions,
) {
  console.log(`${pc.blue("-")} Deleting datasource entry: ${migration.id}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not deleting datasource entry`);
    return;
  }

  try {
    // First verify the entry exists
    const response = await api.datasourceEntries.get(migration.id);
    const entry = response.data.datasource;

    if (!entry) {
      throw new Error(`Datasource entry with ID "${migration.id}" not found`);
    }

    console.log(`${pc.blue("-")} Deleting datasource entry: ${entry.name}`);

    await api.datasourceEntries.delete(migration.id);
    console.log(
      `${pc.green("✓")} Datasource entry deleted successfully: ${entry.name}`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to delete datasource entry:`, error);
    throw error;
  }
} */

async function handleTransformEntries(
  migration: TransformEntriesMigration,
  options: RunMigrationOptions,
) {
  console.log(
    `${pc.blue("-")} Transforming entries for component: ${migration.component}`,
  );

  if (!migration.component || typeof migration.transform !== "function") {
    throw new Error(
      "Transform migration requires a component name and transform function",
    );
  }

  try {
    const component = await helper.updateComponent(migration.component);

    await component.transformEntries(migration.transform, {
      isDryrun: options.isDryrun,
      publish: migration.publish || options.publish,
      publishLanguages: migration.languages || options.publishLanguages,
    });

    console.log(
      `${pc.green("✓")} Entries transformed successfully for: ${migration.component}`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to transform entries:`, error);
    throw error;
  }
}
