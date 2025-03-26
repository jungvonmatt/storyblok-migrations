/* eslint-disable no-undef */
const type = "create-component";

const schema = {
  name: "text",
  display_name: "Text",
  is_root: false,
  is_nestable: true,
  component_group_name: "Content",

  schema: {
    body: {
      type: "richtext",
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
    },
    id: {
      type: "text",
      display_name: "HTML ID",
      regex: "^([a-zA-Z]+(?:[a-zA-Z0-9\\-_.:]+)*)*$",
      description: "ID attribute (must start with letter)",
    },
    margin_top: {
      type: "option",
      display_name: "Margin Top",
      source: "internal",
      datasource_slug: "margin",
      default_value: "none",
    },
  },

  tabs: {
    general: ["body"],
    settings: ["id", "margin_top"],
  },
};

module.exports = { type, schema };
