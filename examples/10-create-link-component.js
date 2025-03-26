/* eslint-disable no-undef */
const type = "create-component";

const schema = {
  name: "link",
  display_name: "Link",
  is_root: false,
  is_nestable: true,
  component_group_name: "Content",

  schema: {
    text: {
      type: "text",
      display_name: "Link Text",
      translatable: true,
      required: true,
    },
    url: {
      type: "text",
      display_name: "URL",
      required: true,
      translatable: true,
      description: "External URL or internal path",
    },
    target_blank: {
      type: "boolean",
      display_name: "Open in new tab",
    },
    appearance: {
      type: "option",
      display_name: "Appearance",
      options: [
        { value: "text", name: "Text Link" },
        { value: "button", name: "Button" },
        { value: "button-outline", name: "Button Outline" },
      ],
      default_value: "text",
    },
    id: {
      type: "text",
      display_name: "ID",
      regex: "^([a-zA-Z]+(?:[a-zA-Z0-9\\-_.:]+)*)*$",
      description: "ID attribute (must start with letter)",
    },
  },

  tabs: {
    general: ["text", "url", "target_blank", "appearance"],
    settings: ["id"],
  },
};

module.exports = { type, schema };
