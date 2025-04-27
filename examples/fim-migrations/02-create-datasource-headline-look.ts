import { defineMigration } from "sb-migrate";

const datasource = {
  name: "Headline Look",
  slug: "headline-look",
};

const entries = [
  { name: "Auto", value: "auto" },
  { name: "H1 6XL", value: "h1-6xl" },
  { name: "H1 5XL", value: "h1-5xl" },
  { name: "H1 4XL", value: "h1-4xl" },
  { name: "H1", value: "h1" },
  { name: "H2", value: "h2" },
  { name: "H3", value: "h3" },
  { name: "H4", value: "h4" },
  { name: "H5", value: "h5" },
  { name: "H6", value: "h6" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});
