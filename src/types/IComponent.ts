/* eslint-disable @typescript-eslint/no-explicit-any */
export enum SchemaComponentType {
  Text = "text",
  Textarea = "textarea",
  Bloks = "bloks",
  Richtext = "richtext",
  Markdown = "markdown",
  Number = "number",
  Datetime = "datetime",
  Boolean = "boolean",
  Options = "options",
  Option = "option",
  Asset = "asset",
  Multiasset = "multiasset",
  Multilink = "multilink",
  Table = "table",
  Section = "section",
  Custom = "custom",
  Tab = "tab",
}

export interface IOptions {
  _uid?: string;
  name: string;
  value: string;
}

export type RichtextToolbarKeys =
  | "color"
  | "code"
  | "inlinecode"
  | "list"
  | "bold"
  | "blok"
  | "copy"
  | "cut"
  | "emoji"
  | "h1"
  | "h2"
  | "h3"
  | "h6"
  | "h5"
  | "h4"
  | "highlight"
  | "hrule"
  | "image"
  | "italic"
  | "link"
  | "anchor"
  | "olist"
  | "paragraph"
  | "paste-action"
  | "paste"
  | "quote"
  | "redo"
  | "strike"
  | "undo"
  | "underline"
  | "superscript"
  | "subscript";

export type MarkdownToolbarKeys =
  | "bold"
  | "italic"
  | "inlinecode"
  | "code"
  | "h1"
  | "h2"
  | "quote"
  | "hrule"
  | "olist"
  | "list"
  | "h6"
  | "h5"
  | "h4"
  | "h3"
  | "link"
  | "image"
  | "paragraph"
  | "help"
  | "toggle-richtext";

export type AssetFileTypes = "images" | "videos" | "audios" | "texts";

export interface IComponentSchemaItemBase {
  type: Omit<SchemaComponentType, "section" | "tab">;
  display_name?: string;
  required?: boolean;
  translatable?: boolean;
  description?: string;
  tooltip?: boolean;
  force_merge?: boolean;
  exclude_from_overwrite?: boolean;
  exclude_from_merge?: boolean;
  pos?: number;
}

export interface IComponentSchemaItemText extends IComponentSchemaItemBase {
  type: "text";
  rtl?: boolean;
  default_value?: string;
  max_length?: number;
  regex?: string;
}

export interface IComponentSchemaItemTextarea extends IComponentSchemaItemBase {
  type: "textarea";
  rtl?: boolean;
  max_length?: number;
  default_value?: string;
}

export interface IComponentSchemaItemBlocks extends IComponentSchemaItemBase {
  type: "bloks";
  minimum?: number;
  maximum?: number;
  default_value?: string;
  restrict_type?: string;
  restrict_components?: true;
  component_whitelist?: Array<string>;
  component_group_whitelist?: Array<string>;
}

export interface IComponentSchemaItemRichtext extends IComponentSchemaItemBase {
  type: "richtext";
  max_length?: number;
  default_value?: string;
  style_options?: Array<IOptions>;
  customize_toolbar?: boolean;
  toolbar?: Array<RichtextToolbarKeys>;
  restrict_type?: string;
  restrict_components?: boolean;
  component_whitelist?: Array<string>;
  allow_target_blank?: boolean;
  allow_custom_attributes?: boolean;
}

export interface IComponentSchemaItemMarkdown extends IComponentSchemaItemBase {
  type: "markdown";
  rtl?: boolean;
  rich_markdown?: boolean;
  allow_multiline?: boolean;
  customize_toolbar?: boolean;
  toolbar?: Array<MarkdownToolbarKeys>;
  max_length?: number;
  default_value?: string;
}

export interface IComponentSchemaItemNumber extends IComponentSchemaItemBase {
  type: "number";
  default_value?: string;
  min_value?: 0;
  max_value?: 1;
  decimals?: 2;
  steps?: 10;
}

export interface IComponentSchemaItemDateTime extends IComponentSchemaItemBase {
  type: "datetime";
  disable_time?: boolean;
  default_value?: string;
}

export interface IComponentSchemaItemDateTime extends IComponentSchemaItemBase {
  type: "datetime";
  disable_time?: boolean;
  default_value?: string;
}

export interface IComponentSchemaItemBoolean extends IComponentSchemaItemBase {
  type: "boolean";
  inline_label?: boolean;
  default_value?: boolean;
}

export type ISchemaSource =
  | {
      source?: "self";
      options?: Array<string | { name: string; value: string }>;
    }
  | {
      source: "internal_stories";
      folder_slug?: string;
      filter_content_type?: Array<string>;
    }
  | { source: "internal_languages" }
  | { source: "internal"; datasource_slug?: string }
  | { source: "external"; external_datasource?: string };

export type IComponentSchemaItemOptions = IComponentSchemaItemBase & {
  type: "options";
  exclude_empty_option?: boolean;
  min_options?: string;
  max_options?: string;
  default_value?: string;
} & ISchemaSource;

export type IComponentSchemaItemOption = IComponentSchemaItemBase & {
  type: "option";
  use_uuid?: boolean;
  exclude_empty_option?: boolean;
  min_options?: string;
  max_options?: string;
  default_value?: string;
} & ISchemaSource;

export interface IComponentSchemaItemAsset extends IComponentSchemaItemBase {
  type: "asset";
  allow_external_url?: boolean;
  filetypes?: Array<AssetFileTypes>;
  asset_folder_id?: number;
}

export interface IComponentSchemaItemMultiAsset
  extends IComponentSchemaItemBase {
  type: "multiasset";
  allow_external_url?: boolean;
  filetypes?: Array<AssetFileTypes>;
  asset_folder_id?: number;
}

export interface IComponentSchemaItemLink extends IComponentSchemaItemBase {
  type: "multilink";
  email_link_type?: boolean;
  asset_link_type?: boolean;
  show_anchor?: boolean;
  allow_target_blank?: boolean;
  allow_custom_attributes?: boolean;
  restrict_content_types?: boolean;
  component_whitelist?: Array<string>;
  force_link_scope?: boolean;
  link_scope?: string;
}

export interface IComponentSchemaItemTable extends IComponentSchemaItemBase {
  type: "table";
}

export type IComponentSchemaItemGroup = {
  type: "section";
  display_name?: string;
  keys?: Array<string>;
  pos?: number;
};

export type IComponentSchemaItemPlugin = IComponentSchemaItemBase & {
  type: "custom";
  field_type?: string;
  options?: Array<IOptions>;
  required_fields?: string;
} & ISchemaSource;

export type IComponentSchemaTab = {
  type: "tab";
  display_name?: string;
  keys?: Array<string>;
  pos?: number;
};

export type IComponentSchemaItem =
  | IComponentSchemaItemText
  | IComponentSchemaItemTextarea
  | IComponentSchemaItemBlocks
  | IComponentSchemaItemRichtext
  | IComponentSchemaItemMarkdown
  | IComponentSchemaItemNumber
  | IComponentSchemaItemDateTime
  | IComponentSchemaItemDateTime
  | IComponentSchemaItemBoolean
  | IComponentSchemaItemAsset
  | IComponentSchemaItemMultiAsset
  | IComponentSchemaItemLink
  | IComponentSchemaItemTable
  | IComponentSchemaItemGroup
  | IComponentSchemaItemPlugin
  | IComponentSchemaItemOption
  | IComponentSchemaItemOptions;

// export interface IComponentSchema {
//   [property: string]: IComponentSchemaItem | IComponentSchemaTab;
// }

/**
 * Interface of a pending Storyblok component.
 *
 * @export
 * @interface IComponent
 */
export interface IPendingComponent<
  T = IComponentSchemaItem | IComponentSchemaTab,
> {
  name: string;
  display_name?: string;
  schema?: Record<string, T>;
  image?: string | null;
  preview_tmpl?: string | null;
  is_root?: boolean;
  is_nestable?: boolean;
  all_presets?: any[];
  preset_id?: number | null;
  real_name?: string | null;
  component_group_uuid?: string | null;
  color?: string | null;
  icon?: string | null;
}

export interface IComponent<T = IComponentSchemaItem | IComponentSchemaTab>
  extends IPendingComponent<T> {
  readonly created_at: string;
  readonly id: number;
  readonly updated_at?: string;
}

export const isComponentSchemaBaseItem = (
  data: any,
): data is IComponentSchemaItemBase => {
  return [
    "text",
    "textarea",
    "bloks",
    "richtext",
    "markdown",
    "number",
    "datetime",
    "boolean",
    "options",
    "option",
    "asset",
    "multiasset",
    "multilink",
    "table",
    "custom",
    "image",
    "file",
  ].includes(data?.type);
};
