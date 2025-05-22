import { defineMigration, optionField } from "sb-migrate";

export default defineMigration({
  type: "update-component",
  schema: {
    name: "headline",
    schema: {
      margin_top: optionField({
        display_name: "Margin Top",
        source: "internal",
        datasource_slug: "margin",
        default_value: "none",
      }),
    },
    tabs: {
      general: ["text"],
      settings: ["look", "tag", "weight", "color", "margin_top"],
    },
  },
});
