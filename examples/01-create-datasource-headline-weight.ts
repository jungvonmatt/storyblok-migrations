import { defineMigration } from "@jungvonmatt/sb-migrate";

const datasource = {
  name: "Headline Weight",
  slug: "headline-weight",
};

const entries = [
  { name: "Regular", value: "regular" },
  { name: "Medium", value: "medium" },
  { name: "SemiBold", value: "semibold" },
  { name: "Bold", value: "bold" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});
