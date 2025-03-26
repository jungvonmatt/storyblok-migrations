import pc from "picocolors";
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
const isStoryPublishedWithoutChanges = (story: IStory): boolean => {
  return story.published === true && story.unpublished_changes === false;
};

/**
 * @method isStoryWithUnpublishedChanges
 * @param  {Object} story
 * @return {Boolean}
 */
const isStoryWithUnpublishedChanges = (story: IStory): boolean => {
  return story.published === true && story.unpublished_changes === true;
};

export type MigrationFn = (blok: IStoryContent) => void;

export const runMigration = async (
  component: string,
  migrationFn: MigrationFn,
  options?: RunMigrationOptions,
): Promise<{ executed: boolean; motive?: string }> => {
  // Dynamically import deepEqual
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
