import { defineMigration } from "sb-migrate";

const datasource = {
  name: "Text Align",
  slug: "text-align",
};

const entries = [
  { name: "Left", value: "text-left" },
  { name: "Center", value: "text-center" },
  { name: "Right", value: "text-right" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});
