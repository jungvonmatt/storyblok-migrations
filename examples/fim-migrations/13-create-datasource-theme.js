import { defineMigration } from "sb-migrate";

const datasource = {
  name: "Theme",
  slug: "theme",
};

const entries = [
  { name: "Light", value: "light" },
  { name: "Dark", value: "dark" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});
