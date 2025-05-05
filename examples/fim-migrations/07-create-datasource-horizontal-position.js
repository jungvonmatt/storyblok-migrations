import { defineMigration } from "sb-migrate";

const datasource = {
  name: "Horizontal Position",
  slug: "horizontal-position",
};

const entries = [
  { name: "Left", value: "start" },
  { name: "Center", value: "center" },
  { name: "Right", value: "end" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});
