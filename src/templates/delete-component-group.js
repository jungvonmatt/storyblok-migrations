import { defineMigration } from "sb-migrate";

export default defineMigration({
  type: "delete-component-group",
  // Replace with actual ID when implementing the migration
  id: "example-group-id",
  description: "{{migrationName}}",
});
