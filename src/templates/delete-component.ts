import { defineMigration } from "@jungvonmatt/sb-migrate";

export default defineMigration({
  type: "delete-component",
  description: "{{migrationName}}",
  // The name of the component to delete (case-sensitive)
  name: "example-component",
});
