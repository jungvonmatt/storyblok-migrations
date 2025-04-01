import { MigrationFn } from "../utils/migration";
import { IComponentSchemaItem } from "./IComponent";
import { IStoryContent } from "./stories";

export type MigrationType =
  | "create-component-group"
  | "update-component-group"
  | "delete-component-group"
  | "create-component"
  | "update-component"
  | "delete-component"
  | "create-story"
  | "update-story"
  | "delete-story"
  | "create-datasource"
  | "update-datasource"
  | "delete-datasource"
  | "create-datasource-entry"
  | "update-datasource-entry"
  | "delete-datasource-entry"
  | "transform-entries";

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
  schema: Record<string, IComponentSchemaItem>;
  tabs?: Record<string, string[]>;
};

export type StoryMigration = {
  name: string;
  slug?: string;
  parent_id?: number;
  content: IStoryContent;
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

export interface RunOptions {
  dryRun?: boolean;
  space?: string;
  token?: string;
  publish?: "all" | "published" | "published-with-changes";
  languages?: string;
}

// Base migration interface
export interface BaseMigration {
  type: MigrationType;
  description?: string;
}

// Component Group Migrations
export interface CreateComponentGroupMigration extends BaseMigration {
  type: "create-component-group";
  groups: ComponentGroupMigration[];
}

export interface UpdateComponentGroupMigration extends BaseMigration {
  type: "update-component-group";
  id: number;
  group: ComponentGroupMigration;
}

export interface DeleteComponentGroupMigration extends BaseMigration {
  type: "delete-component-group";
  id: number;
}

// Component Migrations
export interface CreateComponentMigration extends BaseMigration {
  type: "create-component";
  schema: ComponentMigration;
}

export interface UpdateComponentMigration extends BaseMigration {
  type: "update-component";
  name: string;
  schema: Partial<ComponentMigration>;
}

export interface DeleteComponentMigration extends BaseMigration {
  type: "delete-component";
  name: string;
}

// Story Migrations
export interface CreateStoryMigration extends BaseMigration {
  type: "create-story";
  story: StoryMigration;
}

export interface UpdateStoryMigration extends BaseMigration {
  type: "update-story";
  id: number;
  story: Partial<StoryMigration>;
}

export interface DeleteStoryMigration extends BaseMigration {
  type: "delete-story";
  id: number;
}

// Datasource Migrations
export interface CreateDatasourceMigration extends BaseMigration {
  type: "create-datasource";
  datasource: DatasourceMigration;
}

export interface UpdateDatasourceMigration extends BaseMigration {
  type: "update-datasource";
  id: number | string;
  datasource: Partial<DatasourceMigration>;
}

export interface DeleteDatasourceMigration extends BaseMigration {
  type: "delete-datasource";
  id: number | string;
}

// Datasource Entry Migrations
export interface CreateDatasourceEntryMigration extends BaseMigration {
  type: "create-datasource-entry";
  entry: DatasourceEntryMigration;
}

export interface UpdateDatasourceEntryMigration extends BaseMigration {
  type: "update-datasource-entry";
  id: number | string;
  entry: Partial<DatasourceEntryMigration>;
}

export interface DeleteDatasourceEntryMigration extends BaseMigration {
  type: "delete-datasource-entry";
  id: number | string;
}

export interface TransformEntriesMigration extends BaseMigration {
  type: "transform-entries";
  component: string;
  transform: MigrationFn;
  publish?: "all" | "published" | "published-with-changes";
  languages?: string;
}

// Union type of all possible migrations
export type Migration =
  | CreateComponentGroupMigration
  | UpdateComponentGroupMigration
  | DeleteComponentGroupMigration
  | CreateComponentMigration
  | UpdateComponentMigration
  | DeleteComponentMigration
  | CreateStoryMigration
  | UpdateStoryMigration
  | DeleteStoryMigration
  | CreateDatasourceMigration
  | UpdateDatasourceMigration
  | DeleteDatasourceMigration
  | CreateDatasourceEntryMigration
  | UpdateDatasourceEntryMigration
  | DeleteDatasourceEntryMigration
  | TransformEntriesMigration;
