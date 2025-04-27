import { defineMigration } from "sb-migrate";

const datasource = {
  name: "Headline Weight",
  slug: "headline-weight",
};

const entries = [
  { name: "Normal", value: "normal" },
  { name: "Medium", value: "medium" },
  { name: "Semi Bold", value: "semi-bold" },
  { name: "Bold", value: "bold" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});
