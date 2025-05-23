/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  isComponentSchemaBaseItem,
  IComponentSchemaItem,
  IComponentSchemaTab,
  IComponent,
} from "../types/IComponent";
import {
  IPendingDataSource,
  IPendingDataSourceEntry,
  IDataSource,
  IDataSourceEntry,
} from "../types/IDataSource";
import { components, datasources, datasourceEntries } from "./api";
import { IStoryContent } from "../types/stories/IStoryContent";
import fs from "fs";
import path from "path";
import pc from "picocolors";
import { isArray, isPlainObject, has } from "lodash";

let i18nComponentsFields: Record<string, string[]>;

/**
 * Retrieves all translatable fields for all components.
 * This function caches the results in memory to avoid repeated API calls.
 *
 * @returns {Promise<Record<string, string[]>>} A record mapping component names to arrays of their translatable field names
 */
const getAllTranslatableComponentFields = async (): Promise<
  Record<string, string[]>
> => {
  if (!i18nComponentsFields) {
    const response = await components.getAll();
    const entries = response.data.components.map((component) => {
      const compName = component.name;
      const compSchema = component.schema;
      const translatableKeys = Object.entries(compSchema || {}).flatMap(
        ([key, item]) => {
          if (isComponentSchemaBaseItem(item) && item.translatable) {
            return [key];
          }
          return [];
        },
      );

      return [compName, translatableKeys];
    });
    i18nComponentsFields = Object.fromEntries(entries);
  }

  return i18nComponentsFields;
};

/**
 * Retrieves the translatable fields for a specific component.
 * This function uses the cached results from getAllTranslatableComponentFields.
 *
 * @param {string} component - The name of the component to get translatable fields for
 * @returns {Promise<string[]>} An array of translatable field names for the component
 */
export const getTranslatableComponentFields = async (
  component: string,
): Promise<string[]> => {
  const i18nFields = await getAllTranslatableComponentFields();
  return i18nFields?.[component] ?? [];
};

/**
 * Creates a new datasource or updates an existing one with the provided entries.
 * If the datasource exists, it will be updated with the new entries.
 * If it doesn't exist, a new one will be created.
 *
 * @param {string | IPendingDataSource} ds - Either a string name or a datasource object
 * @param {Omit<IPendingDataSourceEntry, "datasource_id">[]} dsEntries - Array of entries to add to the datasource
 * @returns {Promise<[IDataSource, IDataSourceEntry[]]>} Tuple containing the datasource and its entries
 */
export const addOrUpdateDatasource = async (
  ds: string | IPendingDataSource,
  dsEntries: Omit<IPendingDataSourceEntry, "datasource_id">[],
): Promise<[IDataSource, IDataSourceEntry[]]> => {
  const { name, slug } = typeof ds === "string" ? { name: ds, slug: ds } : ds;
  let entry: IDataSource;
  if (await datasources.has(slug)) {
    const response = await datasources.get(slug);
    entry = response.data.datasource;
  } else {
    const response = await datasources.create({
      slug,
      name,
    });
    entry = response.data.datasource;
  }

  const entries = await datasourceEntries.getAll(entry);
  const checkedEntries: IDataSourceEntry[] = [];
  for (const dsEntry of entries.data.datasource_entries || []) {
    if (
      !dsEntries.some(
        (e) => e.value === dsEntry.value && e.name === dsEntry.name,
      )
    ) {
      await datasourceEntries.delete(dsEntry);
    } else {
      checkedEntries.push(dsEntry);
    }
  }

  for (const dsEntry of dsEntries) {
    if (
      checkedEntries
        .filter(Boolean)
        .map((e) => e.value)
        .includes(dsEntry.value)
    ) {
      continue;
    }

    const response = await datasourceEntries.create({
      name: dsEntry.name,
      value: dsEntry.value,
      datasource_id: entry.id,
    });
    checkedEntries.push(response.data.datasource);
  }

  return [entry, checkedEntries] as [IDataSource, IDataSourceEntry[]];
};

/**
 * Type guard to check if a schema item is a tab.
 *
 * @param {IComponentSchemaItem | IComponentSchemaTab} value - The schema item to check
 * @returns {boolean} True if the item is a tab, false otherwise
 */
const isTab = (
  value: IComponentSchemaItem | IComponentSchemaTab,
): value is IComponentSchemaTab => value?.type === "tab";

/**
 * Gets a tab from a component's schema by name, or creates a new one if it doesn't exist.
 *
 * @param {IComponent} component - The component to get the tab from
 * @param {string} name - The name of the tab to find
 * @returns {[string, IComponentSchemaTab]} Tuple containing the tab key and the tab object
 */
const getTab = (
  component: IComponent,
  name: string,
): [string, IComponentSchemaTab] => {
  const nameRegexp = new RegExp(name, "i");
  for (const [key, value] of Object.entries(component.schema ?? {})) {
    if (isTab(value) && nameRegexp.test(value?.display_name ?? "")) {
      return [key, value];
    }
  }

  return [`tab-${name}`, { display_name: name, type: "tab" }];
};

/**
 * Resets a tab in a component's schema by clearing its keys.
 *
 * @param {IComponent} component - The component containing the tab
 * @param {string} name - The name of the tab to reset
 * @returns {IComponent} A new component with the reset tab
 */
export function resetTab(component: IComponent, name: string): IComponent {
  const [key, content] = getTab(component, name);

  return {
    ...component,
    schema: {
      ...component.schema,
      [key]: {
        ...content,
        keys: [],
      },
    },
  };
}

/**
 * Moves fields to a specified tab in a component's schema.
 *
 * @param {IComponent} component - The component to modify
 * @param {string} name - The name of the tab to move fields to
 * @param {string[]} keys - Array of field names to move to the tab
 * @param {number} [pos] - Optional position for the tab
 * @returns {IComponent} A new component with the updated tab
 */
export function moveToTab(
  component: IComponent,
  name: string,
  keys: Array<string> = [],
  pos?: number,
): IComponent {
  const [key, content] = getTab(component, name);
  return {
    ...component,
    schema: {
      ...component.schema,
      [key]: {
        ...content,
        pos,
        keys: [...keys],
      },
    },
  };
}

/**
 * Gets the deprecated tab from a component's schema, or creates one if it doesn't exist.
 *
 * @param {IComponent} component - The component to get the deprecated tab from
 * @returns {[string, IComponentSchemaTab]} Tuple containing the tab key and the tab object
 */
export const getDeprecatedTab = (
  component: IComponent,
): [string, IComponentSchemaTab] => getTab(component, "deprecated");

/**
 * Moves fields to the deprecated tab in a component's schema.
 *
 * @param {IComponent} component - The component to modify
 * @param {string[]} keys - Array of field names to move to the deprecated tab
 * @returns {IComponent} A new component with the updated deprecated tab
 */
export function moveToDeprecated(
  component: IComponent,
  keys: Array<string> = [],
): IComponent {
  return moveToTab(component, "deprecated", keys);
}

/**
 * Moves fields to the settings tab in a component's schema.
 *
 * @param {IComponent} component - The component to modify
 * @param {string[]} keys - Array of field names to move to the settings tab
 * @returns {IComponent} A new component with the updated settings tab
 */
export function moveToSettings(
  component: IComponent,
  keys: Array<string> = [],
): IComponent {
  return moveToTab(component, "settings", keys);
}

/**
 * Adds or updates fields in a component's schema.
 *
 * @param {IComponent} component - The component to modify
 * @param {Record<string, IComponentSchemaItem | IComponentSchemaTab>} fields - The fields to add or update
 * @returns {IComponent} A new component with the updated fields
 */
export function addOrUpdateFields(
  component: IComponent,
  fields: Record<string, IComponentSchemaItem | IComponentSchemaTab>,
): IComponent {
  return {
    ...component,
    schema: {
      ...fields,
      ...component.schema,
      ...fields,
    },
  };
}

// Reimplementation of the 'createRollbackFile' and 'processMigration' function from storyblok-cli
// https://github.com/storyblok/storyblok-cli/blob/master/src/tasks/migrations/utils.js
const MIGRATIONS_ROLLBACK_DIRECTORY = `${process.cwd()}/migrations/rollback`;

/**
 * Creates a rollback file to store the original state of stories for potential rollback operations.
 * The file is stored in the migrations/rollback directory with a date prefix.
 *
 * @param {any[]} rollbackData - Array containing story data for rollback
 * @param {string} component - Component name
 * @param {string} field - Field name or 'generic' for general migrations
 * @returns {Promise<{component: string, created: boolean}>} Object indicating success and component name
 * @throws {Error} If file creation fails
 */
export const createRollbackFile = async (
  rollbackData: any[],
  component: string,
  field: string,
): Promise<{ component: string; created: boolean }> => {
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(MIGRATIONS_ROLLBACK_DIRECTORY)) {
      fs.mkdirSync(MIGRATIONS_ROLLBACK_DIRECTORY, { recursive: true });
    }

    // Define the rollback file path with date
    const date = new Date().toISOString().split("T")[0];
    const fileName = `${date}_rollback_${component}_${field}.json`;
    const filePath = path.join(MIGRATIONS_ROLLBACK_DIRECTORY, fileName);

    // Remove existing file if present
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Write rollback data to file
    fs.writeFileSync(filePath, JSON.stringify(rollbackData, null, 2));

    console.log(
      `${pc.green("✓")} The rollback file has been created in migrations/rollback/!`,
    );

    return {
      component,
      created: true,
    };
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to create rollback file:`, error);
    return Promise.reject(error);
  }
};

/**
 * Recursively processes content to apply migrations to matching components.
 * This function handles nested components, blocks, and rich text content.
 *
 * @param {IStoryContent} content - Content structure from Storyblok
 * @param {string} component - Name of the component being processed
 * @param {Function} migrationFn - Migration function defined by user
 * @param {string} storyFullSlug - Full slug of the containing story
 * @returns {Promise<boolean>} True if processing completed successfully
 */
export const processMigration = async (
  content: IStoryContent = {} as IStoryContent,
  component: string = "",
  migrationFn: (blok: IStoryContent) => void,
  storyFullSlug: string,
): Promise<boolean> => {
  // Process the component if it matches the target
  if (content.component === component) {
    try {
      // Apply the migration function
      migrationFn(content);
    } catch (e) {
      console.error(
        `${pc.red("✗")} Error processing migration for ${storyFullSlug}:`,
        e,
      );
    }
  }

  // Recursively process nested content
  for (const key in content) {
    const value = content[key];

    // Handle arrays (like nested blocks)
    if (isArray(value)) {
      try {
        await Promise.all(
          value.map((_item) =>
            processMigration(
              _item as IStoryContent,
              component,
              migrationFn,
              storyFullSlug,
            ),
          ),
        );
      } catch (e) {
        console.error(e);
      }
    }

    // Handle objects with component property
    if (isPlainObject(value) && has(value, "component")) {
      try {
        await processMigration(
          value as IStoryContent,
          component,
          migrationFn,
          storyFullSlug,
        );
      } catch (e) {
        console.error(e);
      }
    }

    // Handle rich text fields with bloks
    if (
      isPlainObject(value) &&
      (value as any).type === "doc" &&
      (value as any).content
    ) {
      (value as any).content
        .filter((item: any) => item.type === "blok")
        .forEach(async (item: any) => {
          try {
            await processMigration(
              item.attrs.body,
              component,
              migrationFn,
              storyFullSlug,
            );
          } catch (e) {
            console.error(e);
          }
        });
    }
  }

  return true;
};
