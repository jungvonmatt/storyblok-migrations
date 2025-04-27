import { defineMigration } from "sb-migrate";

const datasource = {
  name: "Height",
  slug: "height",
};

const entries = [
  { name: "Small", value: "sm" },
  { name: "Medium", value: "md" },
  { name: "Large", value: "lg" },
  { name: "X-Large", value: "xl" },
  { name: "Full", value: "full" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});
