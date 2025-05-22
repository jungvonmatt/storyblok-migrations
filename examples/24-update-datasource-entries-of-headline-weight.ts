import { defineMigration } from "sb-migrate";

const entries = [
  { name: "Regular", value: "regular" },
  { name: "Medium", value: "medium" },
  { name: "SemiBold", value: "semibold" },
  { name: "Bold", value: "bold" },
];

const datasource = {
  name: "Headline Weight",
};

export default defineMigration({
  type: "update-datasource",
  id: "headline-weight",
  datasource,
  entries,
});
