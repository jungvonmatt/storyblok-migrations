import pc from "picocolors";
import fs from "fs";
import path from "path";
import {
  IComponent,
  IComponentSchemaItem,
  isComponentSchemaBaseItem,
} from "../types/IComponent";
import { IStoryContent } from "../types/stories/IStoryContent";
import {
  addOrUpdateDatasource,
  addOrUpdateFields,
  moveToTab,
  createRollbackFile,
  processMigration,
} from "./storyblok";
import { UpdateStoryPayload, api } from "./api";

import { cloneDeep, isEmpty, isNull } from "lodash";
import { IStory } from "../types/stories";
import { getPreview } from "./component";
import { StringKeyOf } from "type-fest";
import { MigrationType } from "../types/migration";
import { Migration } from "../types/migration";

export type RunMigrationOptions = {
  isDryrun?: boolean;
  migrationPath?: string;
  publishLanguages?: string;
  publish?: "all" | "published" | "published-with-changes";
};

type RollbackData = {
  id: IStory["id"];
  full_slug: IStory["full_slug"];
  content: IStory["content"];
};

/**
 * @method isStoryPublishedWithoutChanges
 * @param  {Object} story
 * @return {Boolean}
 */
export const isStoryPublishedWithoutChanges = (story: IStory): boolean => {
  return story.published === true && story.unpublished_changes === false;
};

/**
 * @method isStoryWithUnpublishedChanges
 * @param  {Object} story
 * @return {Boolean}
 */
export const isStoryWithUnpublishedChanges = (story: IStory): boolean => {
  return story.published === true && story.unpublished_changes === true;
};

/**
 * @method MigrationFn
 * @param  {Object} blok
 * @return {void}
 */
export type MigrationFn = (blok: IStoryContent) => void;

/**
 * Executes a migration function on all stories containing a specific component.
 *
 * This function:
 * 1. Retrieves all stories containing the specified component
 * 2. Applies the migration function to each story's content
 * 3. Updates stories with changes and handles publishing based on options
 * 4. Creates rollback data for successful changes
 * 5. Tracks and reports statistics on the migration execution
 *
 * @param {string} component - The component name to migrate
 * @param {MigrationFn} migrationFn - Function that performs the actual content migration
 * @param {RunMigrationOptions} [options] - Optional configuration for the migration
 * @param {boolean} [options.isDryrun] - If true, only simulate changes without saving
 * @param {string} [options.migrationPath] - Path to the migration file
 * @param {string} [options.publishLanguages] - Languages to publish changes for
 * @param {"all"|"published"|"published-with-changes"} [options.publish] - Publishing strategy
 *
 * @returns {Promise<{executed: boolean, motive?: string}>} Result of the migration execution
 * @throws {Error} If migration function is missing or execution fails
 *
 * @example
 * ```ts
 * await runMigration('my-component', (content) => {
 *   content.title = 'New Title';
 * }, { publish: 'all' });
 * ```
 */
export const runMigration = async (
  component: string,
  migrationFn: MigrationFn,
  options?: RunMigrationOptions,
): Promise<{ executed: boolean; motive?: string }> => {
  const { deepEqual } = await import("fast-equals");
  const publish = options?.publish || "published";
  const publishLanguages = options?.publishLanguages || "ALL_LANGUAGES";

  try {
    const rollbackData: RollbackData[] = [];

    if (typeof migrationFn !== "function") {
      throw new Error("Missing the migration function");
    }

    console.log(`${pc.blue("-")} Getting stories for ${component} component`);

    const response = await api.stories.getAll({ contain_component: component });
    const stories = response?.data?.stories;

    if (isEmpty(stories)) {
      console.log(
        `${pc.blue("-")} There are no stories for component ${component}!`,
      );
      return Promise.resolve({
        executed: false,
        motive: "NO_STORIES",
      });
    }

    const stats = {
      success: 0,
      skip: 0,
      error: 0,
    };
    for (const story of stories) {
      if (!story.id) {
        stats.skip = stats.skip + 1;
        continue;
      }
      try {
        console.log(`${pc.blue("-")} Processing story ${story.full_slug}`);
        const storyResponse = await api.stories.get(story.id);
        const storyData = storyResponse.data?.story ?? {};
        const oldContent = cloneDeep(storyData.content);

        await processMigration(
          storyData.content,
          component,
          migrationFn,
          story.full_slug ?? "",
        );

        const isChangeContent = !deepEqual(oldContent, storyData.content);

        if (!options?.isDryrun && isChangeContent) {
          stats.success = stats.success + 1;
          console.log(`${pc.blue("-")} Updating story ${story.full_slug}`);

          rollbackData.push({
            id: storyData.id,
            full_slug: storyData.full_slug,
            content: oldContent,
          });

          const payload: UpdateStoryPayload = {
            force_update: "1",
          };

          if (
            publish === "published" &&
            isStoryPublishedWithoutChanges(storyData)
          ) {
            payload.publish = "1";
          }

          if (
            publish === "published-with-changes" &&
            isStoryWithUnpublishedChanges(story)
          ) {
            payload.publish = "1";
          }

          if (publish === "all") {
            payload.publish = "1";
          }

          if (!isNull(publishLanguages) && !isEmpty(publishLanguages)) {
            payload.lang = publishLanguages;
          }

          await api.stories.update(storyData, payload);
          console.log(`${pc.blue("-")} Story updated with success!`);
        } else {
          stats.skip = stats.skip + 1;
        }
      } catch (e) {
        stats.error = stats.error + 1;
        console.error(
          `${pc.red(
            "X",
          )} An error occurred when try to execute migration and update the story: ${
            e instanceof Error ? e.message : e
          }`,
        );
      }

      console.log();
    }

    if (!isEmpty(rollbackData)) {
      await createRollbackFile(rollbackData, component, "generic");
    }

    console.log(
      `${pc.green("✓")} The migration was executed with success for ${
        stories.length
      } entries!`,
    );
    console.log("Success:", pc.green(stats.success));
    console.log("Error:", pc.red(stats.error));
    console.log("Skipped:", pc.yellow(stats.skip));
    return Promise.resolve({
      executed: true,
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * @method showMigrationChanges
 * @param  {String} path      field name
 * @param  {unknown} value    updated value
 * @param  {unknown} oldValue previous value
 */
export const showMigrationChanges = async (
  path: string,
  value: unknown,
  oldValue: unknown,
) => {
  // Dynamically import deepEqual
  const { deepEqual } = await import("fast-equals");

  if (oldValue === undefined) {
    const _value = await getPreview(value);

    console.log(
      `  ${pc.green("-")} Created field "${pc.green(
        path,
      )}" with value "${pc.green(_value)}"`,
    );
    return;
  }

  if (value === undefined) {
    console.log(`  ${pc.red("-")} Removed the field "${pc.red(path)}"`);
    return;
  }

  if (value !== oldValue || !deepEqual(value, oldValue)) {
    const _value = await getPreview(value);
    const _oldValue = await getPreview(oldValue);

    console.log(
      `  ${pc.blue("-")} Updated field "${pc.blue(path)}" from "${pc.blue(
        _oldValue,
      )}" to "${pc.blue(_value)}"`,
    );
  }
};

type Tabs<K extends string = string> = {
  general: K[];
  settings?: K[];
  form?: K[];
  disclaimer?: K[];
  confirmation?: K[];
  "Details Page"?: K[];
  tracking?: K[];
  deprecated?: string[];
};

export class Component {
  instance: IComponent;

  async create(name: string) {
    const response = await api.components.create({ name });
    this.instance = response.data.component;
  }

  async load(name: string) {
    const response = await api.components.get(name);
    this.instance = response.data.component;
  }

  addOrUpdateFields<
    T extends Record<string, IComponentSchemaItem> = Record<
      string,
      IComponentSchemaItem
    >,
  >(fields: T, tabConfig?: Tabs<StringKeyOf<T>>) {
    console.log(
      `Updating fields for component: ${pc.cyan(this.instance.name)}`,
    );

    const tabs: Tabs<StringKeyOf<T>> = tabConfig || {
      general: [],
      deprecated: [],
    };

    const order = Object.values(tabs).flat();

    const newEntries = Object.entries(fields);
    const existingEntries = Object.entries(this.instance.schema || {}).filter(
      ([key]) => !Object.keys(fields).includes(key),
    );

    const allEntries = [...newEntries, ...existingEntries]
      .sort(([a], [b]) => {
        const posA = order.includes(a) ? order.indexOf(a) : Infinity;
        const posB = order.includes(b) ? order.indexOf(b) : Infinity;
        return posA - posB;
      })
      .map(([key, field], index) => [
        key,
        { ...field, pos: index },
      ]) as typeof existingEntries;

    this.instance = addOrUpdateFields(
      this.instance,
      Object.fromEntries(allEntries),
    );

    const keysConfigured = Object.values(tabs).flat();
    allEntries
      .filter(([, value]) => isComponentSchemaBaseItem(value))
      .map(([key]) => key)
      .forEach((key) => {
        if (!keysConfigured.includes(key)) {
          const deprecated = tabs.deprecated || [];
          tabs.deprecated = [...new Set([...deprecated, key])];
        }
      });

    const deprecatedFields = Object.fromEntries(
      allEntries
        .filter(([key]) => tabs.deprecated?.includes(key))
        .map(([key, value]) => [
          key,
          { ...(value as IComponentSchemaItem), required: false },
        ]),
    );
    this.instance = addOrUpdateFields(this.instance, deprecatedFields);

    Object.entries(tabs).forEach(([name, keys], index) => {
      if (!["general", "default"].includes(name.toLowerCase()) && keys.length) {
        this.instance = moveToTab(
          this.instance,
          name,
          keys,
          name.toLowerCase() === "deprecated"
            ? Object.entries(tabs).length + 10
            : index,
        );
      }
    });
  }

  getPos(fieldId: string) {
    const field = this.instance?.schema?.[fieldId];

    if (isComponentSchemaBaseItem(field)) {
      return field?.pos ?? undefined;
    }

    return undefined;
  }

  async transformEntries(
    migrationFn: MigrationFn,
    options: RunMigrationOptions = {},
  ) {
    return runMigration(this.instance.name, migrationFn, options);
  }

  async save() {
    await api.components.update(this.instance);
  }
}

export const helper = {
  ensureDatasource: addOrUpdateDatasource,
  async updateComponent(name: string) {
    const component = new Component();
    try {
      await component.load(name);
    } catch {
      await component.create(name);
    }

    return component;
  },
};

/**
 * Define a type-safe migration object for Storyblok schema changes.
 * This helper function provides compile-time type checking for different migration types.
 *
 * @param migration A strongly-typed migration object that must match one of the following types:
 *                 - ComponentGroupMigration (create/update/delete component groups)
 *                 - ComponentMigration (create/update/delete components)
 *                 - DatasourceMigration (create/update/delete datasources)
 *                 - StoryMigration (create/update/delete stories)
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

/**
 * Finds all migration files (.js and .ts) in the migrations directory and its subdirectories
 * @returns Array of relative paths to migration files
 */
export async function findMigrations(): Promise<string[]> {
  const migrationsDir = path.join(process.cwd(), "migrations");
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  const migrations: string[] = [];

  // Recursively find all .js and .ts files in the migrations directory
  function findFiles(dir: string, basePath: string = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);

      if (entry.isDirectory()) {
        // Recursively search subdirectories
        findFiles(fullPath, relativePath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".js") || entry.name.endsWith(".ts"))
      ) {
        // Add .js and .ts files to the list
        migrations.push(relativePath);
      }
    }
  }

  findFiles(migrationsDir);
  return migrations.sort();
}
