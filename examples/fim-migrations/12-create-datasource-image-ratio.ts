import { defineMigration } from "sb-migrate";

const datasource = {
  name: "Image Ratio",
  slug: "image-ratio",
};

const entries = [
  { name: "Landscape (16:9)", value: "1.77777778" },
  { name: "Rectangle (4:3)", value: "1.33333333" },
  { name: "Square (1:1)", value: "1" },
  { name: "Portrait (3:4)", value: "0.75" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});
