import { defineMigration } from "sb-migrate";

export default defineMigration({
  type: "update-datasource",
  description: "{{migrationName}}",
  // Can be either a numeric ID or a slug
  id: "example-datasource",
  datasource: {
    // Update the datasource name (optional)
    name: "Updated Datasource Name",
    // Update the datasource slug (optional)
    // slug: "updated-datasource-slug",
  },
  // Add new entries or update existing ones (optional)
  entries: [{ name: "New Option", value: "new-option" }],
});
