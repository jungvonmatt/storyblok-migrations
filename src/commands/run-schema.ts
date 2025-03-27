/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import pc from "picocolors";
import {
  Component,
  helper,
  RunMigrationOptions,
  MigrationFn,
} from "../utils/migration";
import { api, UpdateStoryPayload, CreateStoryPayload } from "../utils/api";
import { addOrUpdateDatasource } from "../utils/storyblok";

// TODO: add all types to a separate file
export type ComponentGroupMigration = {
  name: string;
  uuid?: string;
};

export type ComponentMigration = {
  name: string;
  display_name?: string;
  is_root?: boolean;
  is_nestable?: boolean;
  component_group_name?: string;
  schema: Record<string, any>;
  tabs?: Record<string, string[]>;
};

export type StoryMigration = {
  name: string;
  slug?: string;
  parent_id?: number;
  content: Record<string, any>;
  publish?: boolean;
  release_id?: number;
  lang?: string;
};

export type DatasourceMigration = {
  name: string;
  slug: string;
};

export type DatasourceEntryMigration = {
  datasource_id: number | string;
  name: string;
  value: string;
  dimension_value?: string;
};

export type TransformEntriesMigration = {
  component: string;
  transform: MigrationFn;
  publish?: "all" | "published" | "published-with-changes";
  languages?: string;
};

export interface RunSchemaOptions {
  dryRun?: boolean;
  space?: string;
  token?: string;
  publish?: "all" | "published" | "published-with-changes";
  languages?: string;
}

// TODO: refactor runSchema to use a single function for all migration types that will be exported from the sb-migration package.
// The could be a single function that takes a migration object and options and then executes the migration.
// This should make it possible to use type safety and autocomplete for the migration objects.
// TODO: make it also possible to use different types of files as input, e.g. yaml, .js, .ts.
export async function runSchema(
  filePath: string,
  options: RunSchemaOptions = {},
) {
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

    // Execute the migration based on its type
    // TODO: add migration types to a constants file
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
      case "create-datasource-entry":
        await handleCreateDatasourceEntry(migration, migrationOptions);
        break;
      case "update-datasource-entry":
        await handleUpdateDatasourceEntry(migration, migrationOptions);
        break;
      case "delete-datasource-entry":
        await handleDeleteDatasourceEntry(migration, migrationOptions);
        break;
      case "transform-entries":
        await handleTransformEntries(migration, migrationOptions);
        break;
      default:
        console.error(
          `${pc.red("✗")} Unknown migration type: ${migration.type}`,
        );
        process.exit(1);
    }

    console.log(
      `${pc.green("✓")} Migration completed successfully at ${new Date().toISOString()}`,
    );
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
    // Directly fetch existing component groups
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
  migration: { id: number; group: ComponentGroupMigration },
  options: RunMigrationOptions,
) {
  console.log(`${pc.blue("-")} Updating component group: ${migration.id}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not updating component group`);
    console.log(migration.group);
    return;
  }

  try {
    // Fetch the component group to update
    const response = await api.componentGroups.getAll();
    const existingGroups = response.data.component_groups || [];
    const existingGroup = existingGroups.find((g) => g.id === migration.id);

    if (!existingGroup) {
      throw new Error(`Component group with ID ${migration.id} not found`);
    }

    console.log(
      `${pc.blue("-")} Updating group: ${existingGroup.name} to ${migration.group.name}`,
    );

    // You'll need to implement this API endpoint
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
  migration: { id: number },
  options: RunMigrationOptions,
) {
  console.log(`${pc.blue("-")} Deleting component group: ${migration.id}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not deleting component group`);
    return;
  }

  try {
    // Fetch the component group to confirm it exists
    const response = await api.componentGroups.getAll();
    const existingGroups = response.data.component_groups || [];
    const existingGroup = existingGroups.find((g) => g.id === migration.id);

    if (!existingGroup) {
      throw new Error(`Component group with ID ${migration.id} not found`);
    }

    console.log(`${pc.blue("-")} Deleting group: ${existingGroup.name}`);

    // You'll need to implement this API endpoint
    await api.componentGroups.delete(migration.id);

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
    // Check if component already exists
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
    // Use the helper from migration.js to get or create the component
    const component = await helper.updateComponent(migration.name);

    // Update fields if provided
    if (migration.schema) {
      component.addOrUpdateFields(
        migration.schema.schema,
        migration.schema.tabs,
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
    await api.components.delete(migration.name);
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
  migration: { id: number; story: Partial<StoryMigration> },
  options: RunMigrationOptions,
) {
  console.log(`${pc.blue("-")} Updating story: ${migration.id}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not updating story`);
    console.log(migration);
    return;
  }

  try {
    // Get the current story
    const response = await api.stories.get(migration.id);
    const story = response.data.story;

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
          migration.story.content.component || story.content?.component,
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
    console.log(
      `${pc.green("✓")} Story updated successfully: ${story.full_slug}`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to update story:`, error);
    throw error;
  }
}

async function handleDeleteStory(
  migration: { id: number },
  options: RunMigrationOptions,
) {
  console.log(`${pc.blue("-")} Deleting story: ${migration.id}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not deleting story`);
    return;
  }

  try {
    await api.stories.delete(migration.id);
    console.log(`${pc.green("✓")} Story deleted successfully: ${migration.id}`);
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to delete story:`, error);
    throw error;
  }
}

async function handleCreateDatasource(
  migration: { datasource: DatasourceMigration; entries?: any[] },
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
  migration: { id: number | string; datasource: Partial<DatasourceMigration> },
  options: RunMigrationOptions,
) {
  console.log(`${pc.blue("-")} Updating datasource: ${migration.id}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not updating datasource`);
    console.log(migration);
    return;
  }

  try {
    const response = await api.datasources.get(migration.id);
    const datasource = response.data.datasource;

    // Apply updates
    if (migration.datasource.name) {
      datasource.name = migration.datasource.name;
    }
    if (migration.datasource.slug) {
      datasource.slug = migration.datasource.slug;
    }

    await api.datasources.update(datasource);
    console.log(
      `${pc.green("✓")} Datasource updated successfully: ${datasource.name}`,
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
    await api.datasources.delete(migration.id);
    console.log(
      `${pc.green("✓")} Datasource deleted successfully: ${migration.id}`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to delete datasource:`, error);
    throw error;
  }
}

async function handleCreateDatasourceEntry(
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
    const response = await api.datasourceEntries.create({
      datasource_id: Number(migration.entry.datasource_id),
      name: migration.entry.name,
      value: migration.entry.value,
      dimension_value: migration.entry.dimension_value,
    });

    console.log(
      `${pc.green("✓")} Datasource entry created successfully: ${response.data.datasource.name}`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to create datasource entry:`, error);
    throw error;
  }
}

async function handleUpdateDatasourceEntry(
  migration: { id: number | string; entry: Partial<DatasourceEntryMigration> },
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
  migration: { id: number | string },
  options: RunMigrationOptions,
) {
  console.log(`${pc.blue("-")} Deleting datasource entry: ${migration.id}`);

  if (options.isDryrun) {
    console.log(`${pc.yellow("!")} Dry run - not deleting datasource entry`);
    return;
  }

  try {
    await api.datasourceEntries.delete(migration.id);
    console.log(
      `${pc.green("✓")} Datasource entry deleted successfully: ${migration.id}`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to delete datasource entry:`, error);
    throw error;
  }
}

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

    // Use the transformEntries method from the Component class
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
