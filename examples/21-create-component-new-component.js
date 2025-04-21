import { defineMigration } from "sb-migrate";

export default defineMigration({
  type: "create-component",
  schema: {
    name: "new-component",
    display_name: "New Component",
    is_root: false,
    is_nestable: true,
    component_group_name: "Content",
    schema: {
      title: {
        type: "text",
        pos: 0,
      },
      subtitle: {
        type: "text",
        pos: 1,
      },
    },
    tabs: {
      general: ["title", "subtitle"],
    },
  },
});
