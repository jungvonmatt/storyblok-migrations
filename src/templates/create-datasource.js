import { defineMigration } from "sb-migrate";

const datasource = {
  name: "Example Datasource",
  slug: "example-datasource",
};

const entries = [
  { name: "Option 1", value: "option-1" },
  { name: "Option 2", value: "option-2" },
  { name: "Option 3", value: "option-3" },
];

export default defineMigration({
  type: "create-datasource",
  description: "{{migrationName}}",
  datasource,
  entries,
});
