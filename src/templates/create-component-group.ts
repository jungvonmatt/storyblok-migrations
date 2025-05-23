import { defineMigration } from "@jungvonmatt/sb-migrate";

const groups = [
  {
    name: "Example Group",
  },
  // Add more groups as needed
];

export default defineMigration({
  type: "create-component-group",
  description: "{{migrationName}}",
  groups,
});
