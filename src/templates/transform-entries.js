import { defineMigration } from "sb-migrate";

export default defineMigration({
  type: "transform-entries",
  description: "{{migrationName}}",
  // The component type to transform
  component: "example-component",
  // The transform function that will be applied to each entry
  transform: (blok) => {
    // Example: Modify a field in the component
    if (blok.title) {
      // Convert to uppercase
      blok.title = blok.title.toUpperCase();
    }

    // Example: Add a new field or set a default value
    if (!blok.created_at) {
      blok.created_at = new Date().toISOString();
    }

    // The transform function should modify the blok in-place
    // No need to return anything
  },
  // Options for publishing:
  // - "all": Publish all entries after transformation
  // - "published": Only publish entries that were already published
  // - "published-with-changes": Only publish entries that were published and have changes
  publish: "published-with-changes",
  // Specify language(s) to process, or "ALL_LANGUAGES" for all languages
  languages: "en",
});
