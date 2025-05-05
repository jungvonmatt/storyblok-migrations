import { defineMigration } from "sb-migrate";

const datasource = {
  name: "Object Position",
  slug: "object-position",
};

const entries = [
  { name: "Center", value: "center" },
  { name: "Top", value: "top" },
  { name: "Top Right", value: "top-right" },
  { name: "Right", value: "right" },
  { name: "Bottom Right", value: "bottom-right" },
  { name: "Bottom", value: "bottom" },
  { name: "Bottom Left", value: "bottom-left" },
  { name: "Left", value: "left" },
  { name: "Top Left", value: "top-left" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});
