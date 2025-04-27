import { defineMigration } from "sb-migrate";

const datasource = {
  name: "Image Layout",
  slug: "image-layout",
};

const entries = [
  { name: "Raw", value: "raw" },
  { name: "Fill", value: "fill" },
  { name: "Intrinsic", value: "intrinsic" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});
