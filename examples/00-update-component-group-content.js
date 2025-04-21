import { defineMigration } from "sb-migrate";

export default defineMigration({
  type: "update-component-group",
  id: "Contents",
  group: {
    name: "Content",
  },
});
