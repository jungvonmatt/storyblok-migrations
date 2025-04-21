import {
  defineMigration,
  optionField,
  richtextField,
  textField,
} from "sb-migrate";

export default defineMigration({
  type: "create-component",
  schema: {
    name: "text",
    display_name: "Text",
    is_root: false,
    is_nestable: true,
    component_group_name: "Contents",

    schema: {
      body: richtextField({
        display_name: "Text Content",
        translatable: true,
        customize_toolbar: true,
        toolbar: [
          "bold",
          "italic",
          "strike",
          "underline",
          "link",
          "paragraph",
          "h2",
          "h3",
          "quote",
          "list",
          "olist",
        ],
      }),
      id: textField({
        display_name: "HTML ID",
        regex: "^([a-zA-Z]+(?:[a-zA-Z0-9\\-_.:]+)*)*$",
        description: "ID attribute (must start with letter)",
      }),
      margin_top: optionField({
        display_name: "Margin Top",
        source: "internal",
        datasource_slug: "margin",
        default_value: "none",
      }),
      margin_bottom: optionField({
        display_name: "Margin Bottom",
        source: "internal",
        datasource_slug: "margin",
        default_value: "none",
      }),
    },

    tabs: {
      general: ["body"],
      settings: ["id", "margin_top"],
    },
  },
});
