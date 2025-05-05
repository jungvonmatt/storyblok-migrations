import { defineMigration } from "sb-migrate";

const datasource = {
  name: "Overlay Page Types",
  slug: "overlay-page-types",
};

const entries = [
  { name: "Global", value: "global" },
  { name: "Home page", value: "home" },
  { name: "Content page", value: "content-pages" },
  { name: "PLP", value: "default-plp,lenses-plp,lenses-care-plp" },
  { name: "PDP", value: "product" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});
