import { defineMigration } from "sb-migrate";

const datasource = {
  name: "Object Fit",
  slug: "object-fit",
};

const entries = [
  { name: "Cover", value: "cover" },
  { name: "Contain", value: "contain" },
  { name: "Fill", value: "fill" },
  { name: "ScaleDown", value: "scale-down" },
  { name: "None", value: "none" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});
