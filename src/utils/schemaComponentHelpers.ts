import {
  IComponentSchemaItemText,
  IComponentSchemaItemTextarea,
  IComponentSchemaItemBlocks,
  IComponentSchemaItemRichtext,
  IComponentSchemaItemMarkdown,
  IComponentSchemaItemNumber,
  IComponentSchemaItemDateTime,
  IComponentSchemaItemBoolean,
  IComponentSchemaItemOptions,
  IComponentSchemaItemOption,
  IComponentSchemaItemAsset,
  IComponentSchemaItemMultiAsset,
  IComponentSchemaItemLink,
  IComponentSchemaItemTable,
  IComponentSchemaItemGroup,
  IComponentSchemaItemPlugin,
  IComponentSchemaTab,
  IOptions,
} from "../types/IComponent";

// Text field helper
export const textField = (
  props: Omit<IComponentSchemaItemText, "type">,
): IComponentSchemaItemText => ({
  type: "text",
  ...props,
});

// Textarea field helper
export const textareaField = (
  props: Omit<IComponentSchemaItemTextarea, "type">,
): IComponentSchemaItemTextarea => ({
  type: "textarea",
  ...props,
});

// Blocks field helper
export const bloksField = (
  props: Omit<IComponentSchemaItemBlocks, "type">,
): IComponentSchemaItemBlocks => ({
  type: "bloks",
  ...props,
});

// Richtext field helper
export const richtextField = (
  props: Omit<IComponentSchemaItemRichtext, "type">,
): IComponentSchemaItemRichtext => ({
  type: "richtext",
  ...props,
});

// Markdown field helper
export const markdownField = (
  props: Omit<IComponentSchemaItemMarkdown, "type">,
): IComponentSchemaItemMarkdown => ({
  type: "markdown",
  ...props,
});

// Number field helper
export const numberField = (
  props: Omit<IComponentSchemaItemNumber, "type">,
): IComponentSchemaItemNumber => ({
  type: "number",
  ...props,
});

// DateTime field helper
export const datetimeField = (
  props: Omit<IComponentSchemaItemDateTime, "type">,
): IComponentSchemaItemDateTime => ({
  type: "datetime",
  ...props,
});

// Boolean field helper
export const booleanField = (
  props: Omit<IComponentSchemaItemBoolean, "type">,
): IComponentSchemaItemBoolean => ({
  type: "boolean",
  ...props,
});

// Options field helper
export const optionsField = (props: {
  // Base properties from IComponentSchemaItemBase (except 'type')
  display_name?: string;
  required?: boolean;
  translatable?: boolean;
  description?: string;
  tooltip?: boolean;
  force_merge?: boolean;
  exclude_from_overwrite?: boolean;
  exclude_from_merge?: boolean;
  pos?: number;

  // Options-specific properties
  exclude_empty_option?: boolean;
  min_options?: string;
  max_options?: string;
  default_value?: string;

  // ISchemaSource properties made simple
  source?:
    | "self"
    | "internal_stories"
    | "internal_languages"
    | "internal"
    | "external";
  datasource_slug?: string; // Only works with source: "internal"
  external_datasource?: string; // Only works with source: "external"
  options?: Array<string | { name: string; value: string }>; // For source: "self"
  folder_slug?: string; // For source: "internal_stories"
  filter_content_type?: Array<string>; // For source: "internal_stories"
}): IComponentSchemaItemOptions => ({
  type: "options",
  ...props,
});

// Option field helper
export const optionField = (props: {
  // Base properties from IComponentSchemaItemBase (except 'type')
  display_name?: string;
  required?: boolean;
  translatable?: boolean;
  description?: string;
  tooltip?: boolean;
  force_merge?: boolean;
  exclude_from_overwrite?: boolean;
  exclude_from_merge?: boolean;
  pos?: number;

  // Option-specific properties
  use_uuid?: boolean;
  exclude_empty_option?: boolean;
  min_options?: string;
  max_options?: string;
  default_value?: string;

  // ISchemaSource properties made simple
  source?:
    | "self"
    | "internal_stories"
    | "internal_languages"
    | "internal"
    | "external";
  datasource_slug?: string; // Only works with source: "internal"
  external_datasource?: string; // Only works with source: "external"
  options?: Array<string | { name: string; value: string }>; // For source: "self"
  folder_slug?: string; // For source: "internal_stories"
  filter_content_type?: Array<string>; // For source: "internal_stories"
}): IComponentSchemaItemOption => ({
  type: "option",
  ...props,
});

// Asset field helper
export const assetField = (
  props: Omit<IComponentSchemaItemAsset, "type">,
): IComponentSchemaItemAsset => ({
  type: "asset",
  ...props,
});

// MultiAsset field helper
export const multiassetField = (
  props: Omit<IComponentSchemaItemMultiAsset, "type">,
): IComponentSchemaItemMultiAsset => ({
  type: "multiasset",
  ...props,
});

// Link field helper
export const multilinkField = (
  props: Omit<IComponentSchemaItemLink, "type">,
): IComponentSchemaItemLink => ({
  type: "multilink",
  ...props,
});

// Table field helper
export const tableField = (
  props: Omit<IComponentSchemaItemTable, "type">,
): IComponentSchemaItemTable => ({
  type: "table",
  ...props,
});

// Section field helper
export const sectionField = (
  props: Omit<IComponentSchemaItemGroup, "type">,
): IComponentSchemaItemGroup => ({
  type: "section",
  ...props,
});

// Custom field helper
export const customField = (props: {
  // Base properties from IComponentSchemaItemBase (except 'type')
  display_name?: string;
  required?: boolean;
  translatable?: boolean;
  description?: string;
  tooltip?: boolean;
  force_merge?: boolean;
  exclude_from_overwrite?: boolean;
  exclude_from_merge?: boolean;
  pos?: number;

  // Custom-specific properties
  field_type?: string;
  options?: Array<IOptions>;
  required_fields?: string;

  // ISchemaSource properties made simple
  source?:
    | "self"
    | "internal_stories"
    | "internal_languages"
    | "internal"
    | "external";
  datasource_slug?: string; // Only works with source: "internal"
  external_datasource?: string; // Only works with source: "external"
  folder_slug?: string; // For source: "internal_stories"
  filter_content_type?: Array<string>; // For source: "internal_stories"
}): IComponentSchemaItemPlugin => ({
  type: "custom",
  ...props,
});

// Tab field helper
export const tabField = (
  props: Omit<IComponentSchemaTab, "type">,
): IComponentSchemaTab => ({
  type: "tab",
  ...props,
});
