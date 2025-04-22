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
/**
 * Creates a Text input field for short strings, such as a product or author name.
 *
 * @param props - Text field configuration options
 * @param props.display_name - Display name shown in the Storyblok editor
 * @param props.required - Whether this field is required
 * @param props.translatable - Whether this field can be translated
 * @param props.description - The description is shown in the editor interface
 * @param props.tooltip - Whether to show the description as a tooltip
 * @param props.rtl - Enable right-to-left text direction
 * @param props.default_value - Default text value
 * @param props.max_length - Maximum number of characters allowed
 * @param props.regex - Client Regex validation for the text field type
 * @param props.pos - Position of the field in the component
 * @returns A text field schema component
 *
 * @example
 * ```js
 * textField({
 *   display_name: "Title",
 *   required: true,
 *   translatable: true,
 *   max_length: 50,
 *   regex: "^[A-Za-z0-9 ]+$"
 * })
 * ```
 */
export const textField = (
  props: Omit<IComponentSchemaItemText, "type">,
): IComponentSchemaItemText => ({
  type: "text",
  ...props,
});

// Textarea field helper
/**
 * Creates a Textarea input field for longer strings, such as a product description or a blog post.
 *
 * @param props - Textarea field configuration options
 * @param props.display_name - Display name shown in the Storyblok editor
 * @param props.required - Whether this field is required
 * @param props.translatable - Whether this field can be translated
 * @param props.description - The description is shown in the editor interface
 * @param props.tooltip - Whether to show the description as a tooltip
 * @param props.rtl - Enable right-to-left text direction
 * @param props.default_value - Default text value
 * @param props.max_length - Maximum number of characters allowed
 * @param props.pos - Position of the field in the component
 * @returns A textarea field schema component
 *
 * @example
 * ```js
 * textareaField({
 *   display_name: "Description",
 *   required: false,
 *   translatable: true,
 *   max_length: 255,
 * })
 * ```
 */
export const textareaField = (
  props: Omit<IComponentSchemaItemTextarea, "type">,
): IComponentSchemaItemTextarea => ({
  type: "textarea",
  ...props,
});

// Blocks field helper
/**
 * Creates a Blocks field for nested blocks.
 *
 * @param props - Blocks field configuration options
 * @param props.display_name - Display name shown in the Storyblok editor
 * @param props.required - Whether this field is required
 * @param props.translatable - Whether this field can be translated
 * @param props.description - The description is shown in the editor interface
 * @param props.tooltip - Whether to show the description as a tooltip
 * @param props.minimum - Minimum number of blocks allowed
 * @param props.maximum - Maximum number of blocks allowed
 * @param props.default_value - Default value for the blocks field
 * @param props.restrict_type - Restriction type for components
 * @param props.restrict_components - Whether to restrict the components that can be used
 * @param props.component_whitelist - List of components that can be used when restrict_components is true
 * @param props.component_group_whitelist - List of component groups that can be used when restrict_components is true
 * @param props.pos - Position of the field in the component
 * @returns A blocks field schema component
 *
 * @example
 * ```js
 * bloksField({
 *   display_name: "Content",
 *   minimum: 1,
 *   maximum: 5,
 * })
 * ```
 */
export const bloksField = (
  props: Omit<IComponentSchemaItemBlocks, "type">,
): IComponentSchemaItemBlocks => ({
  type: "bloks",
  ...props,
});

// Richtext field helper
/**
 * Creates a Rich text input field for content with advanced and highly customizable formatting, stored as JSON.
 *
 * @param props - Rich text field configuration options
 * @param props.display_name - Display name shown in the Storyblok editor
 * @param props.required - Whether this field is required
 * @param props.translatable - Whether this field can be translated
 * @param props.description - The description is shown in the editor interface
 * @param props.tooltip - Whether to show the description as a tooltip
 * @param props.max_length - Maximum number of characters allowed
 * @param props.default_value - Default text value
 * @param props.style_options - Array of style options for the rich text editor
 * @param props.customize_toolbar - Whether to customize the toolbar options
 * @param props.toolbar - Array of toolbar items to include (when customize_toolbar is true)
 * @param props.restrict_type - Restriction type for components
 * @param props.restrict_components - Whether to restrict the components that can be used
 * @param props.component_whitelist - List of components that can be used when restrict_components is true
 * @param props.allow_target_blank - Whether to allow target="_blank" in links
 * @param props.allow_custom_attributes - Whether to allow custom attributes in HTML elements
 * @param props.pos - Position of the field in the component
 * @returns A rich text field schema component
 *
 * @example
 * ```js
 * richtextField({
 *   display_name: "Content",
 *   translatable: true,
 *   customize_toolbar: true,
 *   toolbar: ["bold", "italic", "link", "paragraph", "h2", "h3", "quote", "list", "olist"]
 * })
 * ```
 */
export const richtextField = (
  props: Omit<IComponentSchemaItemRichtext, "type">,
): IComponentSchemaItemRichtext => ({
  type: "richtext",
  ...props,
});

// Markdown field helper
/**
 * Creates a text input field for formatted text stored as Markdown
 *
 * @param props - Markdown field configuration options
 * @param props.display_name - Display name shown in the Storyblok editor
 * @param props.required - Whether this field is required
 * @param props.translatable - Whether this field can be translated
 * @param props.description - The description is shown in the editor interface
 * @param props.tooltip - Whether to show the description as a tooltip
 * @param props.rtl - Enable right-to-left text direction
 * @param props.rich_markdown - Enable rich markdown view
 * @param props.allow_multiline - Enable empty paragraphs in markdown
 * @param props.customize_toolbar - Whether to customize the toolbar options
 * @param props.toolbar - Array of toolbar items to include (when customize_toolbar is true)
 * @param props.max_length - Maximum number of characters allowed
 * @param props.default_value - Default text value
 * @param props.pos - Position of the field in the component
 * @returns A markdown field schema component
 *
 * @example
 * ```js
 * markdownField({
 *   display_name: "Content",
 *   translatable: true,
 *   rtl: true,
 *   rich_markdown: true,
 *   allow_multiline: true,
 *   customize_toolbar: true,
 *   toolbar: ["bold", "italic", "link", "paragraph", "h2", "h3", "quote", "list", "olist"]
 * })
 * ```
 */
export const markdownField = (
  props: Omit<IComponentSchemaItemMarkdown, "type">,
): IComponentSchemaItemMarkdown => ({
  type: "markdown",
  ...props,
});

// Number field helper
/**
 * Creates a number input field for numeric values.
 *
 * @param props - Number field configuration options
 * @param props.display_name - Display name shown in the Storyblok editor
 * @param props.required - Whether this field is required
 * @param props.translatable - Whether this field can be translated
 * @param props.description - The description is shown in the editor interface
 * @param props.tooltip - Whether to show the description as a tooltip
 * @param props.default_value - Default numeric value
 * @param props.min_value - Minimum value allowed
 * @param props.max_value - Maximum value allowed
 * @param props.decimals - Number of decimal places
 * @param props.steps - The interval between numbers
 * @param props.pos - Position of the field in the component
 * @returns A number field schema component
 *
 * @example
 * ```js
 * numberField({
 *   display_name: "Quantity",
 *   min_value: 0,
 *   max_value: 100,
 *   decimals: 2,
 *   steps: 1
 * })
 * ```
 */
export const numberField = (
  props: Omit<IComponentSchemaItemNumber, "type">,
): IComponentSchemaItemNumber => ({
  type: "number",
  ...props,
});

// DateTime field helper
/**
 * Creates a date and time input field for date and time values.
 *
 * @param props - DateTime field configuration options
 * @param props.display_name - Display name shown in the Storyblok editor
 * @param props.required - Whether this field is required
 * @param props.translatable - Whether this field can be translated
 * @param props.description - The description is shown in the editor interface
 * @param props.tooltip - Whether to show the description as a tooltip
 * @param props.default_value - Default date and time value
 * @param props.disable_time - Disables time selection from the date picker
 * @param props.pos - Position of the field in the component
 * @returns A date and time field schema component
 *
 * @example
 * ```js
 * datetimeField({
 *   display_name: "Date and Time",
 *   default_value: "2024-01-01 12:00:00",
 *   disable_time: true,
 *   pos: 1
 * })
 * ```
 */
export const datetimeField = (
  props: Omit<IComponentSchemaItemDateTime, "type">,
): IComponentSchemaItemDateTime => ({
  type: "datetime",
  ...props,
});

// Boolean field helper
/**
 * Creates a boolean input field for true/false values.
 *
 * @param props - Boolean field configuration options
 * @param props.display_name - Display name shown in the Storyblok editor
 * @param props.required - Whether this field is required
 * @param props.translatable - Whether this field can be translated
 * @param props.description - The description is shown in the editor interface
 * @param props.tooltip - Whether to show the description as a tooltip
 * @param props.inline_label - Whether to display the label inline with the checkbox
 * @param props.default_value - Default boolean value
 * @param props.pos - Position of the field in the component
 * @returns A boolean field schema component
 *
 * @example
 * ```js
 * booleanField({
 *   display_name: "Active",
 *   default_value: true,
 *   inline_label: true
 * })
 * ```
 */
export const booleanField = (
  props: Omit<IComponentSchemaItemBoolean, "type">,
): IComponentSchemaItemBoolean => ({
  type: "boolean",
  ...props,
});

// Options field helper
/**
 * Creates a multiple options select dropwdown field for Storyblok.
 *
 * @param props - Options field configuration
 * @param props.display_name - Display name shown in the Storyblok editor
 * @param props.required - Whether this field is required
 * @param props.translatable - Whether this field can be translated
 * @param props.description - The description is shown in the editor interface
 * @param props.tooltip - Whether to show the description as a tooltip
 * @param props.exclude_empty_option - Hide empty options in the UI
 * @param props.min_options - Minimum number of options that can be selected
 * @param props.max_options - Maximum number of options that can be selected
 * @param props.default_value - Default option value
 * @param props.source - Source of the options data:
 *   - "self": Manually defined options
 *   - "internal": Use a Storyblok datasource
 *   - "internal_stories": Use Storyblok stories
 *   - "internal_languages": Use available languages
 *   - "external": API Endpoint in Datasource Entries Array Format
 *
 * @param props.datasource_slug - Slug of the datasource when source is "internal"
 * @param props.external_datasource - Name of external datasource when source is "external"
 * @param props.options - Array of options when source is "self"
 * @param props.folder_slug - Folder slug when source is "internal_stories"
 * @param props.filter_content_type - Filter for content types when source is "internal_stories"
 * @param props.pos - Position of the field in the component
 * @returns An options field schema component
 *
 * @example
 * ```js
 * optionsField({
 *   display_name: "Size",
 *   source: "internal",
 *   datasource_slug: "sizes",
 *   default_value: "medium"
 * })
 * ```
 */
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
/**
 * Creates a single option select dropdown field for Storyblok.
 *
 * @param props - Option field configuration
 * @param props.display_name - Display name shown in the Storyblok editor
 * @param props.required - Whether this field is required
 * @param props.translatable - Whether this field can be translated
 * @param props.description - The description is shown in the editor interface
 * @param props.tooltip - Whether to show the description as a tooltip
 * @param props.use_uuid - Whether to use UUIDs for the option values
 * @param props.exclude_empty_option - Hide empty option in the UI
 * @param props.min_options - Minimum number of options that can be selected
 * @param props.max_options - Maximum number of options that can be selected
 * @param props.default_value - Default option value
 * @param props.source - Source of the options data:
 *   - "self": Manually defined options
 *   - "internal": Use a Storyblok datasource
 *   - "internal_stories": Use Storyblok stories
 *   - "internal_languages": Use available languages
 *   - "external": API Endpoint in Datasource Entries Array Format
 * @param props.datasource_slug - Slug of the datasource when source is "internal"
 * @param props.external_datasource - Name of external datasource when source is "external"
 * @param props.options - Array of options when source is "self"
 * @param props.folder_slug - Folder slug when source is "internal_stories"
 * @param props.filter_content_type - Filter for content types when source is "internal_stories"
 * @param props.pos - Position of the field in the component
 * @returns An option field schema component
 *
 * @example
 * ```js
 * // Using a datasource
 * optionField({
 *   display_name: "Size",
 *   source: "internal",
 *   datasource_slug: "sizes",
 *   default_value: "medium"
 * })
 *
 * // Using self-defined options
 * optionField({
 *   display_name: "Alignment",
 *   source: "self",
 *   options: [
 *     { name: "Left", value: "left" },
 *     { name: "Center", value: "center" },
 *     { name: "Right", value: "right" }
 *   ],
 *   default_value: "left"
 * })
 * ```
 */
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
/**
 * Creates an asset field for Storyblok.
 *
 * @param props - Asset field configuration
 * @param props.display_name - Display name shown in the Storyblok editor
 * @param props.required - Whether this field is required
 * @param props.translatable - Whether this field can be translated
 * @param props.description - The description is shown in the editor interface
 * @param props.tooltip - Whether to show the description as a tooltip
 * @param props.allow_external_url - Whether to allow external URLs
 * @param props.filetypes - Array of file type names: ["images", "videos", "audios", "texts"].
 * @param props.asset_folder_id - ID of the asset folder when source is "internal"
 * @param props.pos - Position of the field in the component
 * @returns An asset field schema component
 *
 * @example
 * ```js
 * assetField({
 *   display_name: "Image",
 *   source: "internal",
 *   asset_folder_id: 123
 * })
 * ```
 */
export const assetField = (
  props: Omit<IComponentSchemaItemAsset, "type">,
): IComponentSchemaItemAsset => ({
  type: "asset",
  ...props,
});

// MultiAsset field helper
/**
 * Creates a multi-asset field for Storyblok.
 *
 * @param props - Multi-asset field configuration
 * @param props.display_name - Display name shown in the Storyblok editor
 * @param props.required - Whether this field is required
 * @param props.translatable - Whether this field can be translated
 * @param props.description - The description is shown in the editor interface
 * @param props.tooltip - Whether to show the description as a tooltip
 * @param props.allow_external_url - Whether to allow external URLs
 * @param props.filetypes - Array of file type names: ["images", "videos", "audios", "texts"].
 * @param props.asset_folder_id - ID of the asset folder when source is "internal"
 * @param props.pos - Position of the field in the component
 * @returns A multi-asset field schema component
 *
 * @example
 * ```js
 * multiassetField({
 *   display_name: "Images",
 *   source: "internal",
 *   asset_folder_id: 123
 * })
 * ```
 */
export const multiassetField = (
  props: Omit<IComponentSchemaItemMultiAsset, "type">,
): IComponentSchemaItemMultiAsset => ({
  type: "multiasset",
  ...props,
});

// Link field helper
/**
 * Creates a link field for Storyblok.
 *
 * @param props - Link field configuration
 * @param props.display_name - Display name shown in the Storyblok editor
 * @param props.required - Whether this field is required
 * @param props.translatable - Whether this field can be translated
 * @param props.description - The description is shown in the editor interface
 * @param props.tooltip - Whether to show the description as a tooltip
 * @param props.show_anchor - Whether to show the anchor link
 * @param props.allow_target_blank - Whether to allow target="_blank" in links
 * @param props.allow_custom_attributes - Whether to allow custom attributes in HTML elements
 * @param props.restrict_content_types - Whether to restrict the content types that can be linked
 * @param props.component_whitelist - List of components that can be used when restrict_components is true
 * @param props.force_link_scope - Whether to force the link scope
 * @param props.link_scope - The link scope to use when force_link_scope is true
 * @param props.pos - Position of the field in the component
 * @returns A link field schema component
 *
 * @example
 * ```js
 * multilinkField({
 *   display_name: "Link",
 *   source: "internal",
 *   asset_folder_id: 123
 * })
 * ```
 */
export const multilinkField = (
  props: Omit<IComponentSchemaItemLink, "type">,
): IComponentSchemaItemLink => ({
  type: "multilink",
  ...props,
});

// Table field helper
/**
 * Creates a simple table editor that allows you to insert, move, and delete a flexible number of columns and rows and insert values.
 * IMPORTANT: the rich text field also provides the possibility to manage tables and offers a few more advanced options such as merging cells, setting header columns, and defining cell background colors.
 *
 * @param props - Table field configuration
 * @param props.display_name - Display name shown in the Storyblok editor
 * @param props.required - Whether this field is required
 * @param props.translatable - Whether this field can be translated
 * @param props.description - The description is shown in the editor interface
 * @param props.tooltip - Whether to show the description as a tooltip
 * @param props.pos - Position of the field in the component
 * @returns A table field schema component
 *
 * @example
 * ```js
 * tableField({
 *   display_name: "Table",
 * })
 * ```
 */
export const tableField = (
  props: Omit<IComponentSchemaItemTable, "type">,
): IComponentSchemaItemTable => ({
  type: "table",
  ...props,
});

// Section field helper
/**
 * Creates a section field for Storyblok.
 *
 * @param props - Section field configuration
 * @param props.display_name - Display name shown in the Storyblok editor
 * @param props.required - Whether this field is required
 * @param props.translatable - Whether this field can be translated
 * @param props.description - The description is shown in the editor interface
 * @param props.tooltip - Whether to show the description as a tooltip
 * @param props.keys - Array of keys to use for the section
 * @param props.pos - Position of the field in the component
 * @returns A section field schema component
 *
 * @example
 * ```js
 * sectionField({
 *   display_name: "Section",
 *   keys: ["title", "description", "image"]
 * })
 * ```
 */
export const sectionField = (
  props: Omit<IComponentSchemaItemGroup, "type">,
): IComponentSchemaItemGroup => ({
  type: "section",
  ...props,
});

// Custom field helper
/**
 * Creates an extendable, customizable input.
 *
 * @param props - Custom field configuration
 * @param props.display_name - Display name shown in the Storyblok editor
 * @param props.required - Whether this field is required
 * @param props.translatable - Whether this field can be translated
 * @param props.description - The description is shown in the editor interface
 * @param props.tooltip - Whether to show the description as a tooltip
 * @param props.field_type - The type of field to create
 * @param props.options - Array of options for the field
 * @param props.required_fields - Array of required fields for the field
 * @param props.source - Source of the options data:
 *   - "self": Manually defined options
 *   - "internal": Use a Storyblok datasource
 *   - "internal_stories": Use Storyblok stories
 * @param props.pos - Position of the field in the component
 * @returns A custom field schema component
 *
 * @example
 * ```js
 * customField({
 *   display_name: "Custom",
 * })
 */
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
/**
 * Creates the tabs for the component.
 *
 * @param props - Tab field configuration
 * @param props.display_name - Display name shown in the Storyblok editor
 * @param props.required - Whether this field is required
 * @param props.translatable - Whether this field can be translated
 * @param props.description - The description is shown in the editor interface
 * @param props.tooltip - Whether to show the description as a tooltip
 * @param props.keys - Array of keys to use for the tab
 * @param props.pos - Position of the field in the component
 * @returns A tab field schema component
 *
 * @example
 * ```js
 * tabField({
 *   display_name: "Tab",
 *   keys: ["tab1", "tab2", "tab3"]
 * })
 * ```
 */
export const tabField = (
  props: Omit<IComponentSchemaTab, "type">,
): IComponentSchemaTab => ({
  type: "tab",
  ...props,
});
