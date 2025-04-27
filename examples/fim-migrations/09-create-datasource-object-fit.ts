import { defineMigration } from "sb-migrate";

const datasource = {
  name: "Object Fit",
  slug: "object-fit",
};

const entries = [
  { name: "Contain", value: "contain" },
  { name: "Cover", value: "cover" },
  { name: "Fill", value: "fill" },
  { name: "None", value: "none" },
  { name: "Scale Down", value: "scale-down" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});
