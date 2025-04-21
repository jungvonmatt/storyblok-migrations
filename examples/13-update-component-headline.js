import { defineMigration } from "sb-migrate";

export default defineMigration({
  type: "update-component",
  name: "headline",
  schema: {
    margin_top: {
      type: "option",
      display_name: "Margin Top",
      source: "internal",
      datasource_slug: "margin",
      default_value: "none",
    },
  },
  tabs: {
    general: ["text"],
    settings: ["look", "tag", "weight", "color", "margin_top"],
  },
});
