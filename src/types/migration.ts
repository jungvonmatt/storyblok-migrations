import { MigrationFn } from "../utils/migration";
import { IComponentSchemaItem } from "./IComponent";
import { IPendingDataSourceEntry } from "./IDataSource";
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
  throttle?: number; // Delay in milliseconds between API requests
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
  id: number | string;
  group: ComponentGroupMigration;
}

export interface DeleteComponentGroupMigration extends BaseMigration {
  type: "delete-component-group";
  id: number | string;
}

// Component Migrations
export interface CreateComponentMigration extends BaseMigration {
  type: "create-component";
  schema: ComponentMigration;
}

export interface UpdateComponentMigration extends BaseMigration {
  type: "update-component";
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
  id: number | string;
  story: Partial<StoryMigration>;
}

export interface DeleteStoryMigration extends BaseMigration {
  type: "delete-story";
  id: number | string;
}

// Datasource Migrations
export interface CreateDatasourceMigration extends BaseMigration {
  type: "create-datasource";
  datasource: DatasourceMigration;
  entries?: Omit<IPendingDataSourceEntry, "datasource_id">[];
}

export interface UpdateDatasourceMigration extends BaseMigration {
  type: "update-datasource";
  id: number | string;
  datasource: Partial<DatasourceMigration>;
  entries?: Omit<IPendingDataSourceEntry, "datasource_id">[];
}

export interface DeleteDatasourceMigration extends BaseMigration {
  type: "delete-datasource";
  id: number | string;
}

// Transform Entries Migration
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
  | TransformEntriesMigration;
