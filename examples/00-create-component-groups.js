import { defineMigration } from "sb-migrate";

const groups = [
  {
    name: "Content",
  },
  {
    name: "Media",
  },
  {
    name: "Structure",
  },
];

export default defineMigration({
  type: "create-component-group",
  groups,
});
