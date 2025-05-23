import {
  defineMigration,
  customField,
  optionField,
} from "@jungvonmatt/sb-migrate";

export default defineMigration({
  type: "update-component",
  description: "{{migrationName}}",
  schema: {
    // The name of the component to update (case-sensitive)
    name: "example-component",
    // Only include fields that you want to add or update
    schema: {
      // Add a new field
      description: customField({
        field_type: "markdown",
        translatable: true,
      }),
      // Add a field with options from a datasource
      alignment: optionField({
        display_name: "Text Alignment",
        source: "internal",
        datasource_slug: "text-align",
        default_value: "text-left",
      }),
    },
    // Update tabs to include new fields
    tabs: {
      General: ["title", "subtitle", "description"],
      Settings: ["alignment"],
    },
  },
});
