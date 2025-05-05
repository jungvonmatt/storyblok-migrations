import { defineMigration } from "sb-migrate";

export default defineMigration({
  type: "update-component-group",
  // Replace with actual ID when implementing the migration
  id: "example-group-id",
  description: "{{migrationName}}",
  group: {
    name: "Updated Group Name",
    // Add additional properties here if needed
  },
});
