import {
  defineMigration,
  textField,
  customField,
} from "@jungvonmatt/sb-migrate";

/*

You can use the following helpers to create fields:
- `textField()` - Creates a Text input field for short strings
- `textareaField()` - Creates a Textarea input field for longer strings
- `bloksField()` - Creates a Blocks field for nested blocks
- `richtextField()` - Creates a Rich text field with formatting options
- `markdownField()` - Creates a Markdown text field
- `numberField()` - Creates a number input field
- `datetimeField()` - Creates a date and time input field
- `booleanField()` - Creates a boolean input field
- `optionsField()` - Creates a multiple options select dropdown field
- `optionField()` - Creates a single option select dropdown field
- `assetField()` - Creates an asset field for files
- `multiassetField()` - Creates a multi-asset field for multiple files
- `multilinkField()` - Creates a link field
- `tableField()` - Creates a simple table editor
- `sectionField()` - Creates a section field to group fields
- `customField()` - Creates an extendable, customizable input
- `tabField()` - Creates tabs for the component
*/

export default defineMigration({
  type: "create-component",
  schema: {
    name: "{{migrationName}}",
    display_name: "Example Component",
    is_root: false,
    is_nestable: true,
    component_group_name: "Content",
    schema: {
      title: textField({
        display_name: "Title",
        translatable: true,
        required: true,
      }),
      subtitle: textField({
        display_name: "Subtitle",
        translatable: true,
      }),
      content: customField({
        field_type: "markdown",
        translatable: true,
      }),
      // Add more fields as needed
    },
    tabs: {
      General: ["title", "subtitle", "content"],
      Settings: [],
    },
  },
});
