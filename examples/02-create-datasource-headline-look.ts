import { defineMigration } from "sb-migrate";

const datasource = {
  name: "Headline Look",
  slug: "headline-look",
};

const entries = [
  { name: "H1", value: "h1" },
  { name: "H2", value: "h2" },
  { name: "H3", value: "h3" },
  { name: "H4", value: "h4" },
  { name: "H5", value: "h5" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});
