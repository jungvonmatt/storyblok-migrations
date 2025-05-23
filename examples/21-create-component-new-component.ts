import { defineMigration, textField } from "@jungvonmatt/sb-migrate";

export default defineMigration({
  type: "create-component",
  schema: {
    name: "new-component",
    display_name: "New Component",
    is_root: false,
    is_nestable: true,
    component_group_name: "Content",
    schema: {
      title: textField({
        pos: 0,
      }),
      subtitle: textField({
        pos: 1,
      }),
    },
    tabs: {
      general: ["title", "subtitle"],
    },
  },
});
