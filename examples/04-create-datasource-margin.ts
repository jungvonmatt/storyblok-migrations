import { defineMigration } from "@jungvonmatt/sb-migrate";

const datasource = {
  name: "Margin",
  slug: "margin",
};

const entries = [
  { name: "None", value: "none" },
  { name: "Small", value: "small" },
  { name: "Medium", value: "medium" },
  { name: "Large", value: "large" },
  { name: "Extra Large", value: "xl" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});
