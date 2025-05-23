import { defineMigration } from "@jungvonmatt/sb-migrate";

export default defineMigration({
  type: "delete-story",
  description: "{{migrationName}}",
  // Can be either a numeric ID or a slug
  id: "example-page",
});
